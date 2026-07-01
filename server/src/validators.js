// 입력 검증 — 통과 시 { ok:true, value }, 실패 시 { ok:false, error }

export function validateProduct(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, error: "제품 이름은 필수입니다." };

  if (body.price === undefined || body.price === null || body.price === "") {
    return { ok: false, error: "가격은 필수입니다." };
  }
  const price = Number(body.price);
  if (!Number.isInteger(price) || price < 0) {
    return { ok: false, error: "가격은 0 이상의 정수여야 합니다." };
  }

  return {
    ok: true,
    value: {
      name,
      price,
      summary: typeof body.summary === "string" ? body.summary.trim() : "",
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
    },
  };
}

export function validatePost(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title || !content) {
    return { ok: false, error: "제목·내용은 필수입니다." };
  }
  if (title.length > 100) {
    return { ok: false, error: "제목은 100자를 넘을 수 없습니다." };
  }
  if (content.length > 5000) {
    return { ok: false, error: "내용은 5000자를 넘을 수 없습니다." };
  }

  return { ok: true, value: { title, content } };
}

export function validateComment(body) {
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return { ok: false, error: "댓글 내용은 필수입니다." };
  if (content.length > 1000) {
    return { ok: false, error: "댓글은 1000자를 넘을 수 없습니다." };
  }
  return { ok: true, value: { content } };
}
