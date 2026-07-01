const values = [
  {
    icon: "🌱",
    title: "친환경",
    desc: "원료부터 포장까지 환경 부담을 최소화한 제품만 만듭니다.",
  },
  {
    icon: "🤝",
    title: "정직",
    desc: "성분과 제조 과정을 투명하게 공개하고 과장하지 않습니다.",
  },
  {
    icon: "♻️",
    title: "지속가능",
    desc: "오래 쓰고 자연으로 되돌아가는 순환을 설계합니다.",
  },
];

export default function About() {
  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1>회사소개</h1>
        <p className="mt-4 text-gray-600">
          그린테크는 2020년 설립된 친환경 생활용품 회사입니다. 플라스틱에
          의존하던 일상 용품을 자연 친화적인 소재로 바꾸어, 누구나 부담 없이
          지속가능한 삶을 실천할 수 있도록 돕습니다.
        </p>
      </header>

      <section className="mt-12">
        <h2>미션</h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          “일상의 작은 교체로 지구의 큰 변화를.” 우리는 사용하기 편하면서도
          환경에 해롭지 않은 제품을 합리적인 가격에 제공하는 것을 목표로 합니다.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-6">핵심가치</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <div className="text-3xl" aria-hidden>
                {v.icon}
              </div>
              <h3 className="mt-3">{v.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4">오시는 길</h2>
        <div className="card overflow-hidden">
          <div className="grid h-56 place-items-center bg-brand-50 text-gray-500">
            <span>🗺️ 서울특별시 마포구 친환경로 20, 그린빌딩 4층</span>
          </div>
          <div className="grid gap-2 p-6 text-sm text-gray-600 sm:grid-cols-3">
            <div>
              <div className="font-semibold text-gray-900">주소</div>
              서울 마포구 친환경로 20, 4층
            </div>
            <div>
              <div className="font-semibold text-gray-900">전화</div>
              02-1234-5678
            </div>
            <div>
              <div className="font-semibold text-gray-900">이메일</div>
              hello@greentech.co.kr
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
