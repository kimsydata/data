const output = document.getElementById("output");

function print(message) {
  output.textContent = message;
}

function runVariables() {
  const name = "홍길동";
  let age = 25;
  const isStudent = true;
  const score = 85.5;

  print(`변수와 자료형
이름: ${name}
나이: ${age}
학생 여부: ${isStudent}
점수: ${score}`);
}

function runOperators() {
  const a = 10;
  const b = 3;

  print(`연산자 실습
a + b = ${a + b}
a - b = ${a - b}
a * b = ${a * b}
a / b = ${a / b}
a % b = ${a % b}
a > b = ${a > b}`);
}

function runCondition() {
  const score = Number(prompt("점수를 입력하세요. 예: 85"));
  let grade = "";

  if (score >= 90) {
    grade = "A";
  } else if (score >= 80) {
    grade = "B";
  } else if (score >= 70) {
    grade = "C";
  } else {
    grade = "D";
  }

  print(`입력 점수: ${score}\n등급: ${grade}`);
}

function runLoop() {
  let result = "1부터 10까지 출력\n";

  for (let i = 1; i <= 10; i++) {
    result += `${i} `;
  }

  result += "\n\n짝수만 출력\n";

  for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
      result += `${i} `;
    }
  }

  print(result);
}

function introduceStudent(student) {
  return `${student.name}님의 관심 분야는 ${student.interest.join(", ")}입니다.`;
}

function runFunctionArrayObject() {
  const interests = ["HTML", "CSS", "JavaScript"];

  const student = {
    name: "김학생",
    level: "beginner",
    interest: interests
  };

  print(`함수, 배열, 객체 실습
배열 첫 번째 값: ${interests[0]}
객체 이름: ${student.name}
함수 실행 결과: ${introduceStudent(student)}`);
}
