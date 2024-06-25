document.addEventListener("DOMContentLoaded", () => {
  const createNoteBtn = document.getElementById("create-note");
  const viewNotesBtn = document.getElementById("view-notes");
  const saveNoteBtn = document.getElementById("save-note-button");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const noteInput = document.getElementById("note-input");
  const notesList = document.getElementById("notes-list");
  const errMsg = document.getElementById("err-msg");

  let currentNoteId = null;

  // Resets the note input so it's blank
  function resetNoteInputState() {
    titleInput.value = "";
    contentInput.value = "";
    currentNoteId = null;
    titleInput.disabled = false;
    contentInput.disabled = false;
  }

  // Displays the note input section and hides the saved notes.
  function displayNoteInput() {
    noteInput.style.display = "flex";
    notesList.style.display = "none";
    viewNotesBtn.style.display = "flex";
    createNoteBtn.style.display = "none";
    resetNoteInputState();
  }

  // Displays the list of saved notes and hides the note input 
  function displayNoteList() {
    noteInput.style.display = "none";
    notesList.style.display = "flex";
    viewNotesBtn.style.display = "none";
    createNoteBtn.style.display = "flex";
  }

  // Refreshes notes so the list stays up to date and displays a success
  // message if there is one.
  async function refreshNotesList(
    switchToListView = false,
    showMessage = false,
    message = ""
  ) {
    const notes = await window.electronAPI.getEntries();

    if (switchToListView) {
      displayNoteList();
    }

    displayNotes(notes);

    if (showMessage) {
      showError(message, "success");
    }
  }

  // Switches to note input view.
  createNoteBtn.addEventListener("click", () => {
    displayNoteInput();
    resetNoteInputState();
    console.log("Note input!");
  });
  // Switches to the note list view.
  viewNotesBtn.addEventListener("click", async () => {
    console.log("View notes!");
    displayNoteList();
    try {
      await refreshNotesList(true);
      console.log("Refreshed note list!");
    } catch (error) {
      showError("Failed to fetch notes: " + error.message);
    }
  });
  //Saves note to the database and shows a message.
  saveNoteBtn.addEventListener("click", async function (e) {
    // Stopping the form from being sent.
    e.preventDefault();
    console.log("Save note button clicked!");
    const title = titleInput.value;
    const content = contentInput.value;
    // Throws an error if there's only white space in the note input.
    if (!title || !content) {
      showError("Title and content are required");
      return;
    }
    // A try statement if the save button is being used after editing a note.
    // Little weird thing happens here where it goes to the first else statement and throws
    // an error, even though it updates successfully.  Will troubleshoot later.
    try {
      if (currentNoteId) {
        const changes = await window.electronAPI.updateEntry(currentNoteId, title, content)
        if (changes) {
          await refreshNotesList(false, true, "Saved!")
        } else {
          showError("Note saved!", "Saving");
        }
      } else {
        setTimeout(async () => {
          await window.electronAPI.addEntry(title, content);
        }, 1800);
        await refreshNotesList(false, true, "Saving...");
        setTimeout(() => {
          refreshNotesList(false, true, "Note saved!");
        }, 1050);

      }

      titleInput.value = "";
      contentInput.value = "";
      currentNoteId = null;

    } catch (error) {
      showError("Failed to save note: " + error.message);
    }
  });
  // Adds event listeners to each of the edit and delete buttons created in the notes list.
  function addNoteButtonListeners() {
    const editButtons = document.querySelectorAll(".edit-note-btn");
    const deleteButtons = document.querySelectorAll(".delete-note-btn");
    // Targets the edit button that was clicked and gets the entry by id.
    editButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const noteId = event.target.getAttribute("data-id");
        try {
          const note = await window.electronAPI.getEntry(parseInt(noteId));
          if (note) {
            displayNoteInput();
            titleInput.value = note.title;
            contentInput.value = note.content;
            currentNoteId = note.id;
          } else {
            showError("Note not found");
          }
        } catch (error) {
          showError("Failed to fetch note: " + error.message);
        }
      });
    });
    // Targets the delete button that was clicked and deletes the entry from the database.
    // by id.
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const noteId = event.target.getAttribute("data-id");
        try {
          await window.electronAPI.deleteEntry(parseInt(noteId));
          await refreshNotesList(true);
          showError("Note deleted successfully", "success");
          //   resetNoteInputState();
        } catch (error) {
          showError("Failed to delete note: " + error.message);
        }
      });
    });
  }
  // Creates a display for the notes list.
  function displayNotes(notes) {
    const myNotes = notes
      .map(
        (note) => `
            <div class="note">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <small>ID: ${note.id}, Date: ${note.date}</small>
                <hr>
                <button class="edit-note-btn" data-id="${note.id}">Edit</button>
                <button class="delete-note-btn" data-id="${note.id}">Delete</button>
                <hr>
            </div>
        `
      )
      .join("");

    notesList.innerHTML = `${myNotes}`;
    addNoteButtonListeners();
  }
  //Handles showing error and success messages.
  function showError(message, type = "error") {
    errMsg.textContent = message;
    errMsg.className = type;

    if (type === "success") {
      clearTimeout(errMsg.timeoutId);
      errMsg.timeoutId = setTimeout(() => {
        errMsg.textContent = "";
        errMsg.className = "";
      }, 1050); // Display success message for 1 second
    } else {
      clearTimeout(errMsg.timeoutId);
      errMsg.timeoutId = setTimeout(() => {
        errMsg.textContent = "";
        errMsg.className = "";
      }, 2000); // Display error message for 2 seconds
    }
  }
  // Refreshes the notes list on load.
  refreshNotesList(false);
});