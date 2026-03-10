let storyData = null;
let currentNode = null;

async function loadStory() {
  const response = await fetch("data/story.json");
  storyData = await response.json();

  startStory();
}

function startStory() {
  currentNode = storyData.start;
  renderNode();
}

function renderNode() {
  const node = storyData.nodes[currentNode];

  const storyText = document.getElementById("story-text");
  const choicesContainer = document.getElementById("choices");
  const media = document.getElementById("story-media");

  storyText.innerText = node.text;

  // ⭐ NEW: load scene image
  if (node.media) {
    media.src = node.media;
  }

  choicesContainer.innerHTML = "";

  node.choices.forEach(choice => {
    const button = document.createElement("button");
    button.innerText = choice.text;

    button.onclick = () => {
      currentNode = choice.next;
      renderNode();
    };

    choicesContainer.appendChild(button);
  });
}

loadStory();