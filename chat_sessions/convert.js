const fs = require('fs');

const inputFile = '747042d3-782c-4766-826d-8c3d4537cd9b.json';
const outputFile = 'stm32_learning_experiments.md';

// Read and parse the JSON file
const rawData = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(rawData);

// Sort messages/fragments by id ascending
const messages = data.messages.sort((a, b) => a.id - b.id);

let markdownLines = [
    `# ${data.title || 'Conversation Export'}`,
    ``
];

messages.forEach(msg => {
    const fragId = msg.id;
    let queries = [];
    let contentParts = [];

    if (msg.fragments && Array.isArray(msg.fragments)) {
        msg.fragments.forEach(frag => {
            if (frag.type === 'TOOL_SEARCH' && frag.queries) {
                queries = queries.concat(frag.queries);
            } else if ((frag.type === 'REQUEST' || frag.type === 'RESPONSE') && frag.content) {
                contentParts.push(frag.content.trim());
            } else if (frag.type === 'FILE' && frag.files) {
                frag.files.forEach(file => {
                    const fname = file.file_name || 'unnamed_file';
                    contentParts.push(`*[Attached file: \`${fname}\`]*`);
                });
            }
        });
    }

    const contentMarkdown = contentParts.length > 0 ? contentParts.join('\n\n') : '_No text content_';

    // Format each fragment in Markdown
    markdownLines.push(`## Fragment ${fragId}`);
    markdownLines.push(``);
    markdownLines.push(`- **id**: \`${fragId}\``);
    
    if (queries.length > 0) {
        markdownLines.push(`- **queries**:`);
        queries.forEach(q => {
            markdownLines.push(`  - ${q}`);
        });
    } else {
        markdownLines.push(`- **queries**: \`[]\``);
    }

    markdownLines.push(`- **content**:`);
    markdownLines.push(``);
    markdownLines.push(contentMarkdown);
    markdownLines.push(``);
    markdownLines.push(`---`);
    markdownLines.push(``);
});

// Write the output to a file
fs.writeFileSync(outputFile, markdownLines.join('\n'), 'utf8');
console.log(`Successfully converted ${messages.length} fragments to ${outputFile}`);