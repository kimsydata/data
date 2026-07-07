const loadBtn = document.getElementById("loadBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");
const cardList = document.getElementById("cardList");

loadBtn.addEventListener("click", async function() {
  message.textContent = "데이터를 불러오는 중입니다...";
  cardList.innerHTML = "";

  const places = await fakeFetchTravelPlaces();
  renderCards(places);
  message.textContent = `${places.length}개의 여행지를 불러왔습니다.`;
});

clearBtn.addEventListener("click", function() {
  cardList.innerHTML = "";
  message.textContent = "화면을 지웠습니다.";
});

function fakeFetchTravelPlaces() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(travelPlaces);
    }, 1000);
  });
}

function renderCards(places) {
  places.forEach(function(place) {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <h2>${place.name}</h2>
      <p>${place.description}</p>
      <span class="tag">${place.type}</span>
    `;

    cardList.appendChild(card);
  });
}
