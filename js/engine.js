/*
================================
CONFIG
================================
*/

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 700;



/*
================================
STATE
================================
*/

let storyData = null;
let currentNode = null;



/*
================================
UTILITIES
================================
*/

// preload an image into browser cache
function preloadImage(src) {

  const img = new Image();
  img.src = src;

}


// generate image URL from prompt
function getPromptImage(prompt) {

  const seed = encodeURIComponent(prompt);
  return `https://picsum.photos/seed/${seed}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;

}



/*
================================
STORY VALIDATION
================================
*/

function validateStory(story) {

  const nodes = story.nodes;

  if (!nodes[story.start]) {
    console.error(`Start node "${story.start}" does not exist.`);
  }

  Object.keys(nodes).forEach(nodeKey => {

    const node = nodes[nodeKey];

    if (!node.text) {
      console.warn(`Node "${nodeKey}" is missing text.`);
    }

    if (!node.choices || !Array.isArray(node.choices)) {
      console.warn(`Node "${nodeKey}" has no valid choices array.`);
      return;
    }

    node.choices.forEach(choice => {

      if (!nodes[choice.next]) {
        console.error(
          `Node "${nodeKey}" points to missing node "${choice.next}".`
        );
      }

    });

  });

}



/*
================================
STORY LOADING
================================
*/

async function loadStory() {

  const response = await fetch("data/story.json");
  storyData = await response.json();

  validateStory(storyData);

  startStory();

}



/*
================================
ENGINE
================================
*/

function startStory() {

  currentNode = storyData.start;
  renderNode();

}



function goToNode(nodeKey) {

  currentNode = nodeKey;
  renderNode();

}



/*
================================
RENDERING
================================
*/

function renderNode() {

  const node = storyData.nodes[currentNode];

  const storyText = document.getElementById("story-text");
  const choicesContainer = document.getElementById("choices");
  const media = document.getElementById("story-media");

  storyText.innerText = node.text;

  /*
  --------------------------
  IMAGE HANDLING
  --------------------------
  */

  let newSrc = null;

  if (node.prompt) {

    newSrc = getPromptImage(node.prompt);

  } else if (node.media) {

    newSrc = node.media;

  }

  if (newSrc) {

    media.style.opacity = 0;

    setTimeout(() => {
      media.src = newSrc;
      media.style.opacity = 1;
    }, 200);

  }


  /*
  --------------------------
  CHOICES
  --------------------------
  */

  choicesContainer.innerHTML = "";

  node.choices.forEach(choice => {

    const button = document.createElement("button");

    button.innerText = choice.text;

    button.onclick = () => {

      goToNode(choice.next);

    };

    choicesContainer.appendChild(button);


    /*
    --------------------------
    PRELOAD NEXT SCENE
    --------------------------
    */

    const nextNode = storyData.nodes[choice.next];

    if (nextNode) {

      if (nextNode.prompt) {

        preloadImage(getPromptImage(nextNode.prompt));

      } else if (nextNode.media) {

        preloadImage(nextNode.media);

      }

    }

  });

}

document.getElementById("home-button").onclick = () => {

  // hide story scene
  document.getElementById("scene").style.display = "none";

  // show homepage
  document.getElementById("homepage").style.display = "block";

  // reset story state
  currentNode = null;

};

document.querySelectorAll(".story-card").forEach(card => {

  card.onclick = () => {

    const story = card.dataset.story;

    document.getElementById("homepage").style.display = "none";
    document.getElementById("scene").style.display = "block";

    loadStory(`data/stories/${story}.json`);

  };

});



/*
================================
BOOT
================================
*/

loadStory();