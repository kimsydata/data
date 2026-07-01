// 로그인 시 세션을 새로 발급(세션 고정 공격 방지) 후 인증 정보 저장
export function establishSession(req, auth) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.auth = auth;
      req.session.save((e) => (e ? reject(e) : resolve()));
    });
  });
}
