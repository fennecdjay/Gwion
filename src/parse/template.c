#include <string.h>
#include "gwion_util.h"
#include "gwion_ast.h"
#include "oo.h"
#include "vm.h"
#include "env.h"
#include "type.h"
#include "nspc.h"
#include "traverse.h"
#include "template.h"
#include "vm.h"
#include "parse.h"
#include "gwion.h"

ANN static inline Type owner_type(const Env env, const Type t) {
  const Nspc nspc = t->nspc ? t->nspc->parent : NULL;
  return (nspc && nspc->parent) ? nspc_lookup_type1(nspc->parent, insert_symbol(nspc->name)) : NULL;
}

ANEW ANN static Vector get_types(const Env env, Type t) {
  const Vector v = new_vector(env->gwion->mp);
  do if(GET_FLAG(t, template))
    vector_add(v, (vtype)t->e->def->base.tmpl->list);
  while((t = owner_type(env, t)));
  return v;
}

ANEW ANN static ID_List id_list_copy(MemPool p, ID_List src) {
  const ID_List list = new_id_list(p, src->xid, loc_cpy(p, src->pos));
  ID_List tmp = list;
  while((src = src->next))
    tmp = (tmp->next = new_id_list(p, src->xid, loc_cpy(p, src->pos)));
  return list;
}

ANN static ID_List get_total_type_list(const Env env, const Type t) {
  const Type parent = owner_type(env, t);
  if(!parent)
    return t->e->def->base.tmpl ? t->e->def->base.tmpl->list : NULL;
  const Vector v = get_types(env, parent);
  const ID_List base = (ID_List)vector_pop(v);
  if(!base) {
    free_vector(env->gwion->mp, v);
    return t->e->def->base.tmpl ? t->e->def->base.tmpl->list : NULL;
  }
  const ID_List types = id_list_copy(env->gwion->mp, base);
  ID_List list, tmp = types;
  for(m_uint i = vector_size(v) + 1; --i;) {
    list = (ID_List)vector_pop(v);
    tmp = (tmp->next = id_list_copy(env->gwion->mp, list));
  }
  tmp->next = t->e->def->base.tmpl->list;
  free_vector(env->gwion->mp, v);
  return types;
}

struct tmpl_info {
  const  Class_Def cdef;
  Type_List        call;
  struct Vector_   type;
  struct Vector_   size;
  uint8_t index;
};

ANN static inline size_t tmpl_set(struct tmpl_info* info, const Type t) {
  vector_add(&info->type, (vtype)t);
  const size_t len = strlen(t->name);
  vector_add(&info->size, len);
  return len;
}

ANN static size_t template_size(const Env env, struct tmpl_info* info) {
  ID_List base = info->cdef->base.tmpl->list;
  Type_List call = info->call;
  size_t size = tmpl_set(info, info->cdef->base.type);
  do {
    const Type t = type_decl_resolve(env, call->td);
    CHECK_OB(t)
    size += tmpl_set(info, t);
  } while((call = call->next) && (base = base->next) && ++size);
  return size + 16 + 3;
}

ANN static inline m_str tmpl_get(struct tmpl_info* info, m_str str) {
  const Type t = (Type)vector_at(&info->type, info->index);
  strcpy(str, t->name);
  return str += vector_at(&info->size, info->index);
}

ANN static void template_name(struct tmpl_info* info, m_str s) {
  m_str str = s;
  str = tmpl_get(info, str);
  *str++ = '<';
  const m_uint size = vector_size(&info->type);
  for(info->index = 1; info->index < size; ++info->index) {
    str = tmpl_get(info, str);
    *str++ = (info->index < size - 1) ? ',' : '>';
   }
   *str = '\0';
}

ANEW ANN static Symbol template_id(const Env env, const Class_Def c, const Type_List call) {
  struct tmpl_info info = { .cdef=c, .call=call };
  vector_init(&info.type);
  vector_init(&info.size);
  char name[template_size(env, &info)];
  template_name(&info, name);
  vector_release(&info.type);
  vector_release(&info.size);
  return insert_symbol(name);
}

ANN m_bool template_match(ID_List base, Type_List call) {
  while((call = call->next) && (base = base->next));
  return !call ? 1 : -1;
}

ANN static Class_Def template_class(const Env env, const Class_Def def, const Type_List call) {
  const Symbol name = template_id(env, def, call);
  if(env->class_def && name == insert_symbol(env->class_def->name))
     return env->class_def->e->def;
  const Type t = nspc_lookup_type1(env->curr, name);
  return t ? t->e->def : new_class_def(env->gwion->mp, def->flag, name, def->base.ext, def->body,
    loc_cpy(env->gwion->mp, def->pos));
}

ANN m_bool template_push_types(const Env env, const Tmpl *tmpl) {
  ID_List list = tmpl->list;
  Type_List call = tmpl->call;
  nspc_push_type(env->gwion->mp, env->curr);
  do {
    if(!call)
      break;
    const Type t = known_type(env, call->td);
    if(!t)
      POP_RET(-1);
    nspc_add_type(env->curr, list->xid, t);
    call = call->next;
  } while((list = list->next));
  if(!call)
    return GW_OK;
  POP_RET(-1);
}

extern ANN m_bool scan0_class_def(const Env, const Class_Def);
extern ANN m_bool scan1_class_def(const Env, const Class_Def);
extern ANN m_bool traverse_func_def(const Env, const Func_Def);
extern ANN m_bool traverse_class_def(const Env, const Class_Def);

ANN Type scan_type(const Env env, const Type t, const Type_Decl* type) {
  if(GET_FLAG(t, template)) {
    if(GET_FLAG(t, ref))
      return t;
    if(!type->types)
      ERR_O(t->e->def->pos,
        "you must provide template types for type '%s'", t->name)
    if(template_match(t->e->def->base.tmpl->list, type->types) < 0)
      ERR_O(type->xid->pos, "invalid template types number")
    const Class_Def a = template_class(env, t->e->def, type->types);
    SET_FLAG(a, ref);
    if(a->base.type)
      return a->base.type;
    a->base.tmpl = new_tmpl(env->gwion->mp, get_total_type_list(env, t), 0);
    a->base.tmpl->call = type->types;
    if(isa(t, t_union) < 0) {
      CHECK_BO(scan0_class_def(env, a))
    map_set(&t->e->owner->info->type->map, (vtype)insert_symbol(a->base.type->name),
      (vtype)a->base.type);
    } else {
      a->stmt = new_stmt_union(env->gwion->mp, (Decl_List)a->body, t->e->def->pos);
      a->stmt->d.stmt_union.type_xid = a->base.xid;
      CHECK_BO(scan0_stmt_union(env, &a->stmt->d.stmt_union))
      a->base.type = a->stmt->d.stmt_union.type;
      a->base.type->e->def = a;
      SET_FLAG(a, union);
    }
    SET_FLAG(a->base.type, template | ae_flag_ref);
    a->base.type->e->owner = t->e->owner;
    if(GET_FLAG(t, builtin))
      SET_FLAG(a->base.type, builtin);
    CHECK_BO(scan1_cdef(env, a))
    if(t->nspc->dtor) {
      a->base.type->nspc->dtor = t->nspc->dtor;
      SET_FLAG(a->base.type, dtor);
      ADD_REF(t->nspc->dtor)
    }
    return a->base.type;
  } else if(type->types)
      ERR_O(type->xid->pos,
            "type '%s' is not template. You should not provide template types", t->name)
  return t;
}
