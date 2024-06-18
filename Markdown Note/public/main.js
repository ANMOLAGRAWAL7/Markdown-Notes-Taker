const markdownTextarea = document.querySelector('.markdown-textarea');
const renderedHtmlOutput = document.querySelector('.rendered-html-output');
// Function to render markdown to HTML using markdown-it
async function renderMarkdown() {
    try {
        const markdownText = markdownTextarea.value;
        const response =await fetch("/getmd",{
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({content:markdownText})
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const renderedHTML = data.md;
        renderedHtmlOutput.innerHTML = renderedHTML;
    } catch (error) {
        console.log("unable to render markdown", error);
    }
}
async function getfilehtml(){
    try {
        //console.log("getfilehtml was called");
        const response = await fetch("/getfilehtml",{
            method:"GET",
            headers:{
                'Content-Type': 'application/json'
            }
        });
        if(!response.ok){
            throw new Error('Network grammar response was not ok');
        }
        const data= await response.json();
       // console.log(data);
        const renderedfilehtml=data.html;
        renderedHtmlOutput.innerHTML=renderedfilehtml;
    } catch (error) {
        console.log("unable to render file markdown text",error);
    }
}
// Handle file upload via JavaScript
document.querySelector('.file-upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error('File upload failed');
        }
        await getfilehtml();
    } catch (error) {
        console.log("Unable to upload file", error);
    }
});
// Function to check grammar
async function checkGrammar() {
  try {
    const markdownText = markdownTextarea.value;
    const response = await fetch('/checkgrammar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: markdownText })
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    displayGrammarCheckResults(data.matches);
  } catch (error) {
    console.log("Unable to check grammar", error);
  }
}

// Function to display grammar check results
function displayGrammarCheckResults(matches) {
  grammarCheckResult.innerHTML = '';
  if (matches.length === 0) {
    grammarCheckResult.textContent = 'No grammar issues found.';
    return;
  }
  matches.forEach(match => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'grammar-error';
    errorDiv.textContent = `${match.message} (offset: ${match.offset}, length: ${match.length})`;
    grammarCheckResult.appendChild(errorDiv);
  });
}
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');

searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    const markdownText = markdownTextarea.value;
    console.log("search term is:",searchTerm);
    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: markdownText, searchTerm })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        highlightSearchTerm(markdownText, searchTerm, data.positions);
    } catch (error) {
        console.log("Unable to search and highlight text", error);
    }
});

function highlightSearchTerm(text, searchTerm, positions) {
    let highlightedText = text;
    const offset = searchTerm.length;
    positions.reverse().forEach(pos => {
        highlightedText = highlightedText.slice(0, pos) + '<span class="highlight">' + highlightedText.slice(pos, pos + offset) + '</span>' + highlightedText.slice(pos + offset);
    });
    renderedHtmlOutput.innerHTML = marked.parse(highlightedText);
}

// Event listener for textarea input
markdownTextarea.addEventListener('input', renderMarkdown);
document.querySelector('.grammar-check-button').addEventListener('click', checkGrammar);