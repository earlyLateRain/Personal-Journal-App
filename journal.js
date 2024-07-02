document.addEventListener("DOMContentLoaded", () => {
  const createNoteBtn = document.getElementById("create-note");
  const viewNotesBtn = document.getElementById("view-notes");
  const saveNoteBtn = document.getElementById("save-note-button");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const noteInput = document.getElementById("note-input");
  const notesList = document.getElementById("notes-list");
  const h1 = document.querySelector('h1');

// Get the theme toggle inputs
const lightThemeToggle = document.getElementById('color-scheme-light');
const darkThemeToggle = document.getElementById('color-scheme-dark');

// Function to set the theme based on the selected option
function setTheme(theme) {
  document.body.classList.remove('light-theme', 'dark-theme');

  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  }
}

// Function to handle the theme change event
function handleThemeChange(event) {
  const selectedTheme = event.target.value;
  setTheme(selectedTheme);
  localStorage.setItem('selectedTheme', selectedTheme);
}

// Add event listeners to the theme toggle inputs
lightThemeToggle.addEventListener('change', handleThemeChange);
darkThemeToggle.addEventListener('change', handleThemeChange);

// Get the saved theme from local storage
const savedTheme = localStorage.getItem('selectedTheme');

// Set the initial theme based on the saved theme or the system preference
if (savedTheme) {
  setTheme(savedTheme);
  document.getElementById(`color-scheme-${savedTheme}`).checked = true;
}

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
  ) {
    const notes = await window.electronAPI.getEntries();
    if (switchToListView) {
      displayNoteList();
    }
    displayNotes(notes);
  }

  // Switches to note input view.
  createNoteBtn.addEventListener("click", () => {
    displayNoteInput();
    resetNoteInputState();
  });
  // Switches to the note list view.
  viewNotesBtn.addEventListener("click", async () => {
    displayNoteList();
    try {
      await refreshNotesList(true);
    } catch (error) {
      showNotification(`Failed to fetch notes: error.message`, 'error');
    }
  });
  //Saves note to the database and shows a message.
  saveNoteBtn.addEventListener("click", async function (e) {
    // Stopping the form from being sent.
    e.preventDefault();
    const title = titleInput.value;
    const content = contentInput.value;
    // Throws an error if there's only white space in the note input.
    if (!title || !content) {
      showNotification("Title and content are required", 'error');
      return;
    }
    // A try statement if the save button is being used after editing a note.
    // Little weird thing happens here where it goes to the first else statement and throws
    // an error, even though it updates successfully.  Will troubleshoot later.
    try {
      if (currentNoteId) {
        const changes = await window.electronAPI.updateEntry(currentNoteId, title, content)
        if (changes) {
          await refreshNotesList(false)
          showNotification('Saving...', 'success', 2000)
          setTimeout(() => {
            showNotification('Saved', 'success', 1000)
          }, 1000)
        } else {
          showNotification("Failed to edit note.", error);
        }
      } else {
        setTimeout(async () => {
          await window.electronAPI.addEntry(title, content);
        }, 1800);
        await refreshNotesList(false);
        showNotification('Saving...', 'success')
        setTimeout(() => {
          refreshNotesList(false);
          showNotification("Note saved!", 'success')
        }, 1050);

      }

      titleInput.value = "";
      contentInput.value = "";
      currentNoteId = null;

    } catch (error) {
      showNotification(`Failed to save note: error.message`, 'error');
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
            showNotification("Note not found", error);
          }
        } catch (error) {
          showNotification(`Failed to fetch note: error.message`, 'error');
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
          showNotification("Note deleted successfully", "success");
          //   resetNoteInputState();
        } catch (error) {
          showNotification(`Failed to delete note: error.message`, 'error');
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
  function showNotification(message, type, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, duration);
  }
  // Refreshes the notes list on load.
  refreshNotesList(false);
});