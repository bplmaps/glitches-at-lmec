const textStrings = ["BUILDING", "BLOCKS"];
const letterCounts = {
  B: 9,
  C: 2,
  D: 3,
  G: 5,
  I: 2,
  K: 4,
  L: 10,
  N: 3,
  O: 2,
  S: 4,
  U: 2,
};

let letterImages = {};

for (const letter in letterCounts) {
  let imageArray = []
  
  let count = letterCounts[letter];
  for (let i = 0; i < count; i++) {
    let image = new Image();
    image.src = `https://s3.us-east-2.wasabisys.com/lmec-public-files/building-blocks-letter-blocks/${letter}-${String(i+1).padStart(2,'0')}.png`
    image.setAttribute('data-letter', letter)
    image.classList.add('letter-block-image')
    imageArray.push(image)
  }
  
  letterImages[letter] = imageArray;
}

// console.log(letterImages)


function chooseRandomLetterImage(letter) {
  let randomNumber = Math.floor(Math.random() * letterCounts[letter]);
  return letterImages[letter][randomNumber].cloneNode(true);
}

textStrings.forEach((word, i) => {
  for (const letter of word) {
    let newTextBlock = chooseRandomLetterImage(letter)
    document
      .getElementById(i === 0 ? "column-left" : "column-right")
      .appendChild(newTextBlock);
  }
  
});


setInterval(()=>{
    
        let blocks = document.querySelectorAll('.letter-block-image');
        let chosenBlock = blocks[Math.floor(Math.random()* blocks.length)]
        let newBlock = chooseRandomLetterImage(chosenBlock.getAttribute('data-letter'))
        
        chosenBlock.parentNode.replaceChild(newBlock, chosenBlock)
    

    
  }, 400)

