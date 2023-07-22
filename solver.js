let sizeInputs = document.getElementsByClassName("grid-size-input")
var grid = document.getElementById("input-grid");
var longWordLength = document.getElementById("long-word-length")
var longWordWorth = document.getElementById("long-word-worth")
var resultBox = document.getElementById("result-box")
var result = document.getElementById("result")
var calculateButton = document.getElementById("calculate-button")
var nextButton = document.getElementById("next-button")
var doubleWord = document.getElementById("double-word")
var tripleWord = document.getElementById("triple-word")
var doubleLetter = document.getElementById("double-letter")
var tripleLetter = document.getElementById("triple-letter")
var multipliers = []
multipliers.push(doubleLetter)
multipliers.push(tripleLetter)
multipliers.push(doubleWord)
multipliers.push(tripleWord)

class Point {
    constructor(x, y) {
        if (Number.isNaN(Number(x)) || Number.isNaN(Number(y))) {
            throw new Error('Point inputs should be a number');
        }
        this.x = Number(x);
        this.y = Number(y);
    }

    sum(point) {
        return (new Point(point.x + this.x, point.y + this.y))
    }

    toString() {
        return `(${this.x},${this.y})`
    }

    isIn(arrayCheck) {
        var thisPoint = new Point(this.x, this.y)
        return arrayCheck.some(function (item) { return JSON.stringify(item) == JSON.stringify(thisPoint) })
    }
}

var gridInputs = {}

function generateGrid() {
    if (grid.childNodes.length != 0) {
        grid.innerHTML = ""
    }

    for (let row = 1; row < parseInt(document.getElementById("rows").value) + 1; row++) {
        for (let column = 1; column < parseInt(document.getElementById("columns").value) + 1; column++) {
            let gridInput = document.createElement("input")
            gridInput.type = "text"
            gridInput.id = `${row},${column}`
            gridInput.name = `${row},${column}`
            gridInput.className = `letter-input`
            gridInput.placeholder = (`${row},${column}`)
            gridInput.onclick = function () { this.setSelectionRange(0, this.value.length) }
            gridInputs[new Point(row, column)] = gridInput

            grid.appendChild(gridInput)
        }
    }
    adjustGrid()

    result.innerHTML = "Result"
};

function adjustGrid() {
    for (let row = 1; row < parseInt(document.getElementById("rows").value) + 1; row++) {
        for (let column = 1; column < parseInt(document.getElementById("columns").value) + 1; column++) {
            let gridInput = document.getElementById(`${row},${column}`)
            gridInput.style.width = (parseInt(grid.clientWidth * (1 / parseInt(document.getElementById("rows").value)) - 16) + "px")
            gridInput.style.flex = (`0 1 ${parseInt(grid.clientWidth * (1 / parseInt(document.getElementById("rows").value)) - 16)}`);
        }
    }

    multipliers.forEach(function (element) {
        element.style.width = (parseInt((grid.clientWidth * 0.25) - 16) + "px")
        element.style.flex = (`0 1 ${parseInt((grid.clientWidth * 0.25) - 16)}`);
    })

    calculateButton.style.width = (parseInt((grid.clientWidth * 0.25) - 16) + "px")
    calculateButton.style.flex = (`0 1 ${parseInt((grid.clientWidth * 0.25) - 16)}`);

    nextButton.style.width = (parseInt((grid.clientWidth * 0.25) - 16) + "px")
    nextButton.style.flex = (`0 1 ${parseInt((grid.clientWidth * 0.25) - 16)}`);


    resultBox.style.width = (parseInt((grid.clientWidth * 0.5) - 20) + "px")
    resultBox.style.flex = (`0 1 ${parseInt((grid.clientWidth * 0.5) - 20)}`);
}



var currentGrid = {}

const possibleLetters = [new Point(-1, -1), new Point(0, -1), new Point(1, -1), new Point(-1, 0), new Point(1, 0), new Point(-1, 1), new Point(0, 1), new Point(1, 1)]

possibleTiles = []
for (let row = 1; row < parseInt(document.getElementById("rows").value) + 1; row++) {
    for (let column = 1; column < parseInt(document.getElementById("columns").value) + 1; column++) {
        possibleTiles.push(new Point(row, column))
    }
}

function findPossibleWords(gridLocation, gridLocationsUsed, currentWord, possibleWords) {
    correctWords = []

    if (possibleWords.includes(currentWord + currentGrid[gridLocation])) {
        correctWords.push(
            {
                "word": currentWord + currentGrid[gridLocation],
                "gridLocations": gridLocationsUsed.concat([gridLocation])
            })
    }

    let newPossibleWords = []

    possibleWords.forEach(function (word) {
        if (word.startsWith(currentWord + currentGrid[gridLocation]) && word != currentWord + currentGrid[gridLocation]) {
            newPossibleWords.push(word)
        }
    })

    if (newPossibleWords.length != 0) {
        possibleLetters.forEach(function (letter) {
            if (gridLocation.sum(letter).isIn(possibleTiles) && !(gridLocation.sum(letter).isIn(gridLocationsUsed))) {
                correctWords = correctWords.concat(findPossibleWords(gridLocation.sum(letter), gridLocationsUsed.concat([gridLocation]).slice(), currentWord + currentGrid[gridLocation], newPossibleWords.slice()))
            }
        })
    }

    return correctWords
}

var currentWord
var previousWords

function calculateWord() {
    currentGrid = {}

    for (let row = 1; row < parseInt(document.getElementById("rows").value) + 1; row++) {
        for (let column = 1; column < parseInt(document.getElementById("columns").value) + 1; column++) {
            if (gridInputs[new Point(row, column)].value == "") {
                currentGrid[new Point(row, column)] = " "
            } else {
                currentGrid[new Point(row, column)] = gridInputs[new Point(row, column)].value.toLowerCase()
            }
        }
    }

    if (doubleWord.value == "") {
        doubleWordValue = new Point(0, 0)
    } else {
        doubleWordValue = new Point((doubleWord.value).split(",")[0], (doubleWord.value).split(",")[1])
    }

    if (doubleLetter.value == "") {
        doubleLetterValue = new Point(0, 0)
    } else {
        doubleLetterValue = new Point((doubleLetter.value).split(",")[0], (doubleLetter.value).split(",")[1])
    }

    if (tripleWord.value == "") {
        tripleWordValue = new Point(0, 0)
    } else {
        tripleWordValue = new Point((tripleWord.value).split(",")[0], (tripleWord.value).split(",")[1])
    }

    if (tripleLetter.value == "") {
        tripleLetterValue = new Point(0, 0)
    } else {
        tripleLetterValue = new Point((tripleLetter.value).split(",")[0], (tripleLetter.value).split(",")[1])
    }



    longWordLengthValue = Number(longWordLength.value)

    longWordWorthValue = Number(longWordWorth.value)


    var letterWorth = {}

    for (let i = 97; i <= 122; i++) {
        if (Number.isNaN(Number(document.getElementById(String.fromCharCode(i)).value))) {
            throw new Error('Point inputs should be a number');
        }

        letterWorth[String.fromCharCode(i)] = Number(document.getElementById(String.fromCharCode(i)).value);
    }

    validWords = []

    for (let row = 1; row < parseInt(document.getElementById("rows").value) + 1; row++) {
        for (let column = 1; column < parseInt(document.getElementById("columns").value) + 1; column++) {
            validWords = validWords.concat(findPossibleWords(
                new Point(row, column), [], "", wordlist.slice()
            ))
        }
    }

    validWords.forEach(function (word) {
        let wordWorth = 0
        word["word"].split("").forEach(function (letter) {
            wordWorth += letterWorth[letter]
        })
        if (doubleLetterValue.isIn(word["gridLocations"])) {
            wordWorth += letterWorth[currentGrid[doubleLetterValue]]
        }

        if (tripleLetterValue.isIn(word["gridLocations"])) {
            wordWorth += letterWorth[currentGrid[tripleLetterValue]]
        }

        if (doubleWordValue.isIn(word["gridLocations"])) {
            wordWorth += wordWorth
        }
        if (word["gridLocations"].length >= longWordLengthValue) {
            wordWorth += longWordWorthValue
        }

        if (tripleWordValue.isIn(word["gridLocations"])) {
            wordWorth += wordWorth * 2
        }
        if (word["gridLocations"].length >= longWordLengthValue) {
            wordWorth += longWordWorthValue
        }

        word["worth"] = wordWorth
    })

    validWords = validWords.sort((a, b) => {
        return a["worth"] - b["worth"]
    }).reverse()

    result.innerHTML = `${validWords[0]["word"]}(${validWords[0]["worth"]}): ${validWords[0]["gridLocations"]}`

    currentWord = 0
    previousWords = []
}

function nextWord() {
    previousWords.push(validWords[currentWord]["word"])
    if (!validWords.some(function (word) {
        if (!(previousWords.includes(word["word"]))) {
            currentWord = validWords.indexOf(word)
            result.innerHTML = `${word["word"]}(${word["worth"]}): ${word["gridLocations"]}`
            return true
        }
    })) {
        result.innerHTML = "Could not identify the next word."
    }
}

document.addEventListener("DOMContentLoaded", function () { generateGrid() });

window.addEventListener("resize", function () { adjustGrid() })

Array.from(sizeInputs).forEach(function (input) {
    input.addEventListener("input", function () { generateGrid() });
});

calculateButton.addEventListener("click", function () { calculateWord() })

nextButton.addEventListener("click", function () { nextWord() })
