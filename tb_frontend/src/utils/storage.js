export function getUser() {
  let u = localStorage.getItem("login_user");
  if (u) {
    return JSON.parse(u);
  }
  return null;
}

export function saveUser(user) {
  localStorage.setItem("login_user", JSON.stringify(user));
}

export function clear(user) {
  localStorage.removeItem("login_user");
}
