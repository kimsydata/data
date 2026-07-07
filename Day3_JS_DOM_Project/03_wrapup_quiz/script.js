const answers = {
  q1: "HTML",
  q2: "CSS",
  q3: "JavaScript"
};

const submitBtn = document.getElementById("submitBtn");
const result = document.getElementById("result");

submitBtn.addEventListener("click", function() {
  let score = 0;

  for (const questionName in answers) {
    const selected = document.querySelector(`input[name="${questionName}"]:checked`);

    if (selected && selected.value === answers[questionName]) {
      score++;
    }
  }

  result.textContent = `총 ${Object.keys(answers).length}문제 중 ${score}문제를 맞혔습니다.`;
});
