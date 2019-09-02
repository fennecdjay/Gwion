#include "gwion_util.h"
#include "gwion_ast.h"
#include "oo.h"
#include "env.h"
#include "traverse.h"

ANN m_bool traverse_ast(const Env env, const Ast ast) {
  CHECK_BB(scan0_ast(env, ast))
  CHECK_BB(scan1_ast(env, ast))
  CHECK_BB(scan2_ast(env, ast))
  return check_ast(env, ast);
}

ANN m_bool traverse_decl(const Env env, const Exp_Decl* decl) {
 CHECK_BB(scan1_exp_decl(env, decl))
 CHECK_BB(scan2_exp_decl(env, decl))
 return check_exp_decl(env, decl) ? 1 : -1;
}

ANN m_bool traverse_func_def(const Env env, const Func_Def def) {
  const Func former = env->func;
  const m_bool ret = scan1_func_def(env, def) > 0 &&
     scan2_func_def(env, def) > 0 &&
     check_func_def(env, def) > 0;
  env->func = former;
  return ret ? GW_OK : GW_ERROR;
}

ANN m_bool traverse_union_def(const Env env, const Union_Def def) {
  if(!GET_FLAG(def, scan1))
    CHECK_BB(scan1_union_def(env, def))
  CHECK_BB(scan2_union_def(env, def))
  return check_union_def(env, def);
}

ANN m_bool traverse_enum_def(const Env env, const Enum_Def def) {
  CHECK_BB(scan0_enum_def(env, def))
  CHECK_BB(scan1_enum_def(env, def))
//  CHECK_BB(scan2_enum_def(env, def))
  return check_enum_def(env, def);
}

ANN m_bool traverse_fptr_def(const Env env, const Fptr_Def def) {
  CHECK_BB(scan0_fptr_def(env, def))
  CHECK_BB(scan1_fptr_def(env, def))
  return scan2_fptr_def(env, def);
// CHECK_BB(check_fptr_def(env, def))
}

ANN m_bool traverse_type_def(const Env env, const Type_Def def) {
  CHECK_BB(scan0_type_def(env, def))
  CHECK_BB(scan1_type_def(env, def))
  CHECK_BB(scan2_type_def(env, def))
  return check_type_def(env, def);
}

ANN m_bool traverse_class_def(const Env env, const Class_Def def) {
  if(!GET_FLAG(def, scan1))
    CHECK_BB(scan1_class_def(env, def))
  if(!GET_FLAG(def, scan2))
    CHECK_BB(scan2_class_def(env, def))
  return check_class_def(env, def);
}
