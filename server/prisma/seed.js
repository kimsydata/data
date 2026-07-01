import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "대나무 칫솔",
    price: 3500,
    summary: "100% 생분해 대나무 손잡이 칫솔",
    description:
      "플라스틱 대신 빠르게 자라는 대나무로 만든 손잡이에 BPA-free 부드러운 모를 적용했습니다. 다 쓴 뒤 손잡이는 자연 분해되어 환경 부담을 줄입니다. 4개입 세트로 온 가족이 함께 사용하기 좋습니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80",
  },
  {
    name: "천연 수세미",
    price: 4200,
    summary: "수세미 열매로 만든 주방 설거지 수세미",
    description:
      "합성 스펀지 대신 자연에서 자란 수세미 열매를 그대로 건조해 만들었습니다. 세제 사용량을 줄여주고, 사용 후에는 퇴비로 돌려보낼 수 있습니다. 3개입 구성입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80",
  },
  {
    name: "고체 세제 바",
    price: 8900,
    summary: "물 없이 만든 무포장 고체 빨래세제",
    description:
      "액체 세제의 플라스틱 용기와 물 함량을 없앤 농축 고체 세제입니다. 1개로 약 30회 세탁이 가능하며, 종이 포장으로 배송됩니다. 민감성 피부를 위한 무향 타입입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  },
  {
    name: "스테인리스 빨대",
    price: 6500,
    summary: "반영구적으로 쓰는 세척솔 포함 빨대 세트",
    description:
      "식품용 304 스테인리스로 제작한 빨대 4종(직선·곡선)과 전용 세척솔, 휴대 파우치 구성입니다. 일회용 플라스틱 빨대를 대체해 오래 사용할 수 있습니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1572451440686-2c9c8b3c0f5b?w=800&q=80",
  },
  {
    name: "재생지 노트",
    price: 5500,
    summary: "100% 재생 펄프로 만든 무선 노트",
    description:
      "버려진 종이를 재가공한 재생 펄프로 만든 친환경 노트입니다. 콩기름 잉크로 인쇄했으며, 무염소 표백 공정을 사용했습니다. A5 사이즈, 120매입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
  },
  {
    name: "친환경 장바구니",
    price: 7900,
    summary: "재활용 페트 원단으로 만든 접이식 장바구니",
    description:
      "폐페트병을 재활용한 원단으로 제작한 가볍고 튼튼한 장바구니입니다. 최대 12kg까지 담을 수 있으며, 작게 접어 휴대할 수 있습니다. 비닐봉투 사용을 줄여줍니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1591197172062-c718f82aba20?w=800&q=80",
  },
];

const posts = [
  {
    title: "그린테크 제품 정말 만족스러워요",
    author: "이수민",
    content:
      "대나무 칫솔과 천연 수세미를 함께 주문했는데 품질이 기대 이상입니다. 플라스틱 쓰레기를 줄이는 데 도움이 되는 것 같아 기분이 좋네요. 다음엔 고체 세제도 써볼 생각입니다.",
  },
  {
    title: "고체 세제 사용법 문의드립니다",
    author: "박준호",
    content:
      "고체 세제 바를 처음 사용해 보는데, 드럼 세탁기에도 그대로 넣으면 되나요? 사용량 안내가 더 자세히 있으면 좋겠습니다. 답변 부탁드려요!",
  },
  {
    title: "포장 없는 배송 응원합니다",
    author: "최영아",
    content:
      "주문한 제품이 종이 포장으로 도착했는데 과대포장이 없어서 좋았습니다. 이런 작은 실천이 모여 큰 변화를 만든다고 생각해요. 앞으로도 친환경 행보 기대하겠습니다.",
  },
];

async function main() {
  // 기존 데이터 초기화(시드 멱등성 보장)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.admin.deleteMany();

  await prisma.product.createMany({ data: products });

  // 레거시/관리자 글(소유자 없음 → 관리자만 관리)
  await prisma.post.createMany({ data: posts });

  // 데모용 일반 회원
  const userHash = await bcrypt.hash("user1234", 10);
  const user = await prisma.user.create({
    data: { username: "user1", passwordHash: userHash },
  });
  // 데모용 정지(비활성) 회원
  await prisma.user.create({
    data: {
      username: "user2",
      passwordHash: await bcrypt.hash("user1234", 10),
      active: false,
    },
  });
  // 이 회원이 작성한 글(본인이 수정·삭제 가능)
  const userPost = await prisma.post.create({
    data: {
      title: "회원으로 가입하고 첫 글을 남깁니다",
      author: user.username,
      content:
        "회원가입 후 직접 작성한 글입니다. 이 글은 작성자 본인(user1) 또는 관리자만 수정·삭제할 수 있습니다.",
      userId: user.id,
    },
  });

  const passwordHash = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.admin.create({
    data: { username: "admin", passwordHash },
  });

  // 데모용 댓글(회원 댓글 / 관리자 댓글)
  await prisma.comment.createMany({
    data: [
      {
        content: "좋은 글 감사합니다! 저도 친환경 제품에 관심이 많아요.",
        author: user.username,
        postId: userPost.id,
        userId: user.id,
      },
      {
        content: "그린테크 운영자입니다. 방문해 주셔서 감사합니다 :)",
        author: admin.username,
        postId: userPost.id,
        userId: null,
      },
    ],
  });

  console.log(
    "✅ Seed 완료: 제품 6개, 게시글 4개, 댓글 2개, 회원 2명(user1 활성 / user2 정지), 관리자(admin/admin1234)"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
