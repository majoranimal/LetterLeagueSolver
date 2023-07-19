#!/usr/bin/env python3

from tkinter import *
import json, copy

# Opens the config file and copies it to a variable
with open("config.json") as f:
    config = json.load(f)

# Opens the wordlist and copies it to a variable
with open("wordlist.json") as f:
    wordlist = json.load(f)


# Defines a class for a 2d coordinate system
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __hash__(self):
        return hash((self.x, self.y))

    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)

    def __str__(self):
        return "({}, {})".format(self.x, self.y)

    def __add__(self, point):
        return Point(self.x + point.x, self.y + point.y)

    def __repr__(self):
        return str(self)


# Creates the window and sets it's name, size, and basic layout
root = Tk()
root.geometry("800x800")
root.title("Letter League Solver")
Grid.rowconfigure(root, 0, weight=1)
Grid.columnconfigure(root, 0, weight=1)
frame = Frame(root)
frame.pack()
frame.grid(row=0, column=0, sticky=N + S + E + W)

# Gets width and height from the config and assigns them to variables
rowSize = config.get("width")
columnSize = config.get("height")

# Labels each row and column with their number
for row_index in range(1, rowSize + 1):
    lbl = Label(frame, width=2, text=str(row_index))
    lbl.grid(row=row_index, column=0, sticky=N + S + E + W)
for col_index in range(1, columnSize + 1):
    lbl = Label(frame, width=2, text=str(col_index))
    lbl.grid(row=0, column=col_index, sticky=N + S + E + W)

# Creates a grid of entry boxes inside the window, the amount of rows and columns is set in the config file
# It adds all of the entry boxes to a dictionary so the values can be accessed later
global refr
refr = {}
for row_index in range(1, rowSize + 1):
    Grid.rowconfigure(frame, row_index, weight=1)
    for col_index in range(1, columnSize + 1):
        Grid.columnconfigure(frame, col_index, weight=1)
        entr = Entry(frame, width=2, justify=CENTER)  # create a button inside frame
        entr.grid(row=row_index, column=col_index, sticky=N + S + E + W)
        refr[Point(row_index, col_index)] = entr


# Defines 2d coordinates for the 8 other tiles surrounding the active one
global possibleLetters
possibleLetters = [
    Point(-1, -1),
    Point(0, -1),
    Point(1, -1),
    Point(-1, 0),
    Point(1, 0),
    Point(-1, 1),
    Point(0, 1),
    Point(1, 1),
]

# Creates a list of the locations of the entry boxes in 2d coordinates
possibleTiles = []
for row in range(1, rowSize + 1):
    for col in range(1, columnSize + 1):
        possibleTiles.append(Point(row, col))


# Creates a function that recursively finds every possible word that can be made using "gridLocation" as the first letter
# After finishing returns every possible word and it's grid locations
global result
result = StringVar()
result.set("Result")


def findPossibleWords(gridLocation, gridLocationsUsed, currentWord, possibleWords):
    global currentGrid
    global possibleLetters

    correctWords = []

    if currentWord + currentGrid.get(gridLocation) in possibleWords:
        correctWords.append(
            {
                "word": currentWord + currentGrid.get(gridLocation),
                "gridLocations": gridLocationsUsed + [gridLocation],
            }
        )

    newPossibleWords = []
    for word in possibleWords:
        if word.startswith(
            currentWord + currentGrid.get(gridLocation)
        ) and word != currentWord + currentGrid.get(gridLocation):
            newPossibleWords.append(word)

    if newPossibleWords != []:
        for letter in possibleLetters:
            if (
                gridLocation + letter in possibleTiles
                and gridLocation + letter not in gridLocationsUsed
            ):
                correctWords = correctWords + (
                    findPossibleWords(
                        gridLocation + letter,
                        gridLocationsUsed + [gridLocation],
                        currentWord + currentGrid.get(gridLocation),
                        newPossibleWords,
                    )
                )

    return correctWords


# Uses the findPossibleWords function on every grid position to get every possible word and then calculates their value
# Defines doublesEntry which contains the double letter and double word locations so they can be taken into account
# Appends the worth to each words dictionary in the "validWords" list
# Sets the "result" value to the best possible word thereby it updates the windows result box
global validWords
validWords = []
doublesEntry = {}


def calculateWord():
    global currentGrid
    global validWords

    currentGrid = {}
    for row in range(1, rowSize + 1):
        for col in range(1, columnSize + 1):
            currentGrid[Point(row, col)] = refr.get(Point(row, col)).get().lower()
    if doublesEntry.get("DL").get() == "":
        doubleLetter = Point(0, 0)
    else:
        doubleLetter = Point(
            int(doublesEntry.get("DL").get().split(",")[0]),
            int(doublesEntry.get("DL").get().split(",")[1]),
        )

    if doublesEntry.get("DW").get() == "":
        doubleWord = Point(0, 0)
    else:
        doubleWord = Point(
            int(doublesEntry.get("DW").get().split(",")[0]),
            int(doublesEntry.get("DW").get().split(",")[1]),
        )

    for row in range(1, rowSize + 1):
        for col in range(1, columnSize + 1):
            validWords = validWords + findPossibleWords(
                Point(row, col), [], "", copy.copy(wordlist)
            )

    letterWorth = config.get("letterWorth")

    for word in validWords:
        wordWorth = 0
        for letter in word.get("word"):
            wordWorth += letterWorth.get(letter)
        if doubleWord in word.get("gridLocations"):
            wordWorth += wordWorth
        if doubleLetter in word.get("gridLocations"):
            wordWorth += letterWorth.get(currentGrid.get(doubleLetter))

        word["worth"] = wordWorth
    validWords = sorted(validWords, reverse=True, key=lambda d: d["worth"])

    global result
    result.set(
        str(validWords[0].get("word"))
        + "("
        + str(validWords[0].get("worth"))
        + "): "
        + str(validWords[0].get("gridLocations"))
    )


# Finds the next best word in "validWords" and updates the result box with that word
def nextWord():
    global validWords
    global result
    try:
        words = [x.get("word") for x in validWords]

        word = result.get().split("(")[0]

        newWord = validWords[words.index(word) + words.count(word)]

        result.set(
            str(newWord.get("word"))
            + "("
            + str(newWord.get("worth"))
            + "): "
            + str(newWord.get("gridLocations"))
        )
    except:
        print("Could not identify the next word")


# Adds a button that runs calculateWord
btn = Button(
    frame, width=2, height=2, text="Calculate", command=lambda: calculateWord()
)
btn.grid(row=rowSize + 1, column=1, columnspan=2, sticky=N + S + E + W)

# Adds result box that can be updated using the textvariable "result"
lbl = Label(frame, width=2, textvariable=result)
lbl.grid(row=rowSize + 1, column=3, columnspan=3, sticky=N + S + E + W)

# Adds a double letter and double word location entry box and adds a label for them
# It also appends the entries to the "doublesEntry" list so their values are accessible
entr = Entry(frame, width=2)
entr.grid(row=rowSize + 3, column=1, rowspan=2, sticky=N + S + E + W)

doublesEntry["DL"] = entr

lbl = Label(frame, width=2, text="Double letter")
lbl.grid(row=rowSize + 5, column=1, sticky=N + S + E + W)

entr = Entry(frame, width=2)
entr.grid(row=rowSize + 3, column=3, rowspan=2, sticky=N + S + E + W)

doublesEntry["DW"] = entr

lbl = Label(frame, width=2, text="Double word")
lbl.grid(row=rowSize + 5, column=3, sticky=N + S + E + W)

# Creates a text box that gives the correct format to enter into the double word and double letter boxes
lbl = Label(frame, width=2, text="""Using\n'Row,Column'\nformat""")
lbl.grid(row=rowSize + 4, column=2, rowspan=2, sticky=N + S + E + W)

# Creates a button that runs the "nextWord" function
btn = Button(frame, width=2, height=2, text="Next Word", command=lambda: nextWord())
btn.grid(row=rowSize + 4, column=4, columnspan=1, sticky=N + S + E + W)

# Essentially creates an infinite loop to keep the window open and allow it to take inputs
root.mainloop()
