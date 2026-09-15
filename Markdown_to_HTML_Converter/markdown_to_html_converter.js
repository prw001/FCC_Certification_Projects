const markdownInput = document.getElementById("markdown-input");
const htmlOutputField = document.getElementById("html-output");
const htmlPreview = document.getElementById("preview");
const boldRegex = /[\*|_]{2}[^*_]{1,}[\*|_]{2}/;
const italicRegex = /[\*|_]{1}[^*_]{1,}[\*|_]{1}/;
const headerRegex = /^#+\sw*/;
const imgRegex = /^!\[(.*?)]\(.*?\)/;
const linkRegex = /^\[.*?]\(.*?\)/;
const blockquoteRegex = /^\s*>\s\w*/;
const preBlockquoteRegex = /(?<=\n{1,})|(?<!.*?)/;
let markerRegions = [];

function convertMarkdown()
{
    const mdInput = markdownInput.value;
    markerRegions = [];
    parseMarkers(mdInput);
    markerRegions.sort((a, b) => a.range[0] - b.range[0]);
    const htmlOutput = constructHTML(markerRegions, mdInput);
    htmlOutputField.textContent = htmlOutput;
    htmlPreview.innerHTML = htmlOutput;
    return htmlOutput;
}

//goes through marker ranges and builds the appropriate HTML elements or
//inserts plain text as needed, returning a final compiled HTML output as
//a string

function constructHTML(markerRegions, mdInput)
{
    let idx = 0;
    let html = "";
    let currentEndIdx = 0;
    let currentStartIdx = 0;
    if (markerRegions.length == 0)
    {
        return mdInput;
    }
    for (let i = 0; i < markerRegions.length; ++i)
    {
        let region = markerRegions[i];
        currentStartIdx = region.range[0];
        currentEndIdx = region.range[1];
        //fill gaps not covered by HTML generator functions
        if (idx < currentStartIdx)
        {
            html += mdInput.slice(idx, currentStartIdx).trim();
            idx = currentEndIdx + 1;
        }
        switch(region.type)
        {
            case "boldStart":
                if (region.count > 0)
                {
                    html += `<strong>`;
                }
                else
                {
                    html += mdInput.slice(region.range[0], region.range[1] + 1);
                }
                break;
            case "boldEnd":
                html += "</strong>";
                break;
            case "italicStart":
                if (region.count > 0)
                {
                    html += `<em>`;
                }
                else
                {
                    html += mdInput.slice(region.range[0], region.range[1] + 1);
                }
                break;
            case "italicEnd":
                html += "</em>";
                break;
            case "header":
                html += generateHeader(region.count, mdInput.slice(region.range[0], region.range[1] + 1));
                break;
            case "image":
                html += generateImg(mdInput.slice(region.range[0], region.range[1] + 1));
                break;
            case "link":
                html += generateLink(mdInput.slice(region.range[0], region.range[1] + 1));
                break;
            case "blockquote":
                html += generateQuote(mdInput.slice(region.range[0] + 1, region.range[1] + 1), i);
                break;
            default:
                console.error(`got invalid region type when constructing html: ${region.type}`);
                break;
        }
        idx = region.range[1] + 1;
    };

    if (idx < mdInput.length) //append any dangling plain text
    {
        html += mdInput.slice(idx + 1, mdInput.length - 1);
    }
    return html;
}

function generateHeader(level, text)
{
    let textStart = 0;
    do{
        ++textStart;
    }while (text[textStart] === "#");
    const adjText = discoverNestedEmphasis(text.slice(textStart));
    return `<h${level}>${adjText.trim()}</h${level}>`;
}

function generateImg(text)
{
    const descStart = 2;
    const descEnd = text.search(/(?<=.*?)\]/);
    return `<img alt="${text.slice(descStart, descEnd)}" src="${text.slice(descEnd + 2, text.length - 1)}">`;
}

function generateLink(text)
{
    const descStart = 1;
    const descEnd = text.search(/(?<=.*?)\]\(/);
    const adjText = discoverNestedEmphasis(text.slice(descStart, descEnd));
    return `<a href="${text.slice(descEnd + 2, text.length - 1)}">${adjText}</a>`;
}

function generateQuote(text)
{
    const startIdx = text[0] === ">" ? 1 : 0; //skip including the right arrow.
    const adjText = discoverNestedEmphasis(text.slice(startIdx));
    return `<blockquote>${adjText.trim()}</blockquote>`;
}

function parseMarkers(mdInput)
{
    discoverImages(mdInput);
    discoverLinks(mdInput);
    discoverQuotes(mdInput);
    discoverHeaders(mdInput);
    discoverEmphasis(mdInput);
}

//takes an array of types to check against, and the current index of the marker in question
function indexInExistingRegion(typeList, idx)
{
    for (let i = 0; i < markerRegions.length; ++i)
    {
        if (typeList.includes(markerRegions[i].type))
        {
            if (idx >= markerRegions[i].range[0] && idx <= markerRegions[i].range[1]) return true;
        }
    }
    return false;
}

function regionIsPlainText(testRange)
{
    for (let i = 0; i < markerRegions.length; ++i)
    {
        if (markerRegions[i].range[0] <= testRange[1] || markerRegions[i].range[1] >= testRange[0]) return false;
    }
    return true;
}

function discoverImages(mdInput)
{
    const overridingTypes = ["link", "image"];
    for (let i = 0; i < mdInput.length; ++i)
    {
        if (mdInput[i] === "!")
        {
            if (imgRegex.test(mdInput.slice(i)) && !indexInExistingRegion(overridingTypes, i))
            {
                const endRegionRegex = new RegExp(/(?<=\[.*?]\(.*?\))/);
                markerRegions.push(new markerRegion("image", [i, i + mdInput.slice(i).search(endRegionRegex) - 1]));
            }
        }
    }
}

function discoverLinks(mdInput)
{
    const overridingTypes = ["link", "image"];
    for (let i = 0; i < mdInput.length; ++i)
    {
        if (mdInput[i] === "[")
        {
            if (linkRegex.test(mdInput.slice(i)) && !indexInExistingRegion(overridingTypes, i))
            {
                const endRegionRegex = new RegExp(/(?<=.*?]\(.*?\))/);
                markerRegions.push(new markerRegion("link", [i, i + mdInput.slice(i).search(endRegionRegex) - 1]));
            }
        }
    }

}

function discoverQuotes(mdInput)
{
    const overridingTypes = ["link", "image"];
    for (let i = 0; i < mdInput.length; ++i)
    {
        if (mdInput[i] === ">")
        {
            if ((blockquoteRegex.test(mdInput) || preBlockquoteRegex.test(mdInput.slice(0, i))) &&
                !indexInExistingRegion(overridingTypes, i))
            {
                const nextMarkdownRegex = new RegExp(/(\n){2,}|[#\[>!]/);
                const regionEnd = getNextMarkdown((mdInput.slice(i + 1)), nextMarkdownRegex);
                markerRegions.push(new markerRegion("blockquote", [i, regionEnd === -1 ? mdInput.length - 1 : i + regionEnd]));
            }
        }
    }
}

function discoverHeaders(mdInput)
{
    const overridingTypes = ["link", "image"];
    for (let i = 0; i < mdInput.length; ++i)
    {
        if (mdInput[i] === "#")
        {
            if (headerRegex.test(mdInput.slice(i)) &&
                (i == 0 || markerRegions.length !== 0) &&
                !indexInExistingRegion(overridingTypes, i))
            {
                let j = i;
                let level = 0;
                do{
                    ++level;
                    ++j;
                } while(mdInput[j] === "#");
                const nextMarkdownRegex = new RegExp(/\n|(?=\s[\[#>!])/);
                const offsetFromCurrent = getNextMarkdown((mdInput.slice(j + 1)), nextMarkdownRegex);
                const regionEnd = offsetFromCurrent === -1 ? mdInput.length - 1 : j + offsetFromCurrent;
                markerRegions.push(new markerRegion("header", [i, regionEnd], level));
                i = regionEnd - 1;
            }
        }
    }
}

function getNextMarkdown(mdInput, regex)
{
    return mdInput.search(regex);
}


// this is a mini loop called when generating headers, block quotes, or link text,
// to ensure intentional emphasis on nested text is emphasized, but without
// interfering with the parsing of higher-priority markdown elements when building
// the output html.

function discoverNestedEmphasis(innerText)
{
    let indices = [];
    let innerEmphasisRegions = [];
    let html = "";
    for (let i = 0; i < innerText.length; ++i)
    {
        if (innerText[i] === "*" || innerText[i] === "_")
        {
            indices.push(i);
        }
    }
    if (indices.length <= 1)
    {
        return innerText;
    }

    let italicOpen = false;
    let boldOpen = false;

    for (let i = 0; i < indices.length; ++i)
    {
        if (indices[i + 1] - indices[i] === 1 && !italicOpen)
        {
            if (!boldOpen)
            {
                boldOpen = true;
                innerEmphasisRegions.push(new markerRegion("boldStart", [indices[i], indices[i+1]], 0));
            }
            else
            {
                boldOpen = false;
                innerEmphasisRegions.push(new markerRegion("boldEnd", [indices[i], indices[i+1]], 1));
                updateLastInnerBoldStart(innerEmphasisRegions);
            }
            ++i; //skips the next * or _, which have already been identified by the above 'if'
        }
        else
        {
            if (!italicOpen)
            {
                italicOpen = true;
                innerEmphasisRegions.push(new markerRegion("italicStart", [indices[i], indices[i]], 0));
            }
            else
            {
                italicOpen = false;
                innerEmphasisRegions.push(new markerRegion("italicEnd", [indices[i], indices[i]], 1));
                updateLastInnerItalicStart(innerEmphasisRegions);
            }
        }
    }

    let currentIdx = 0;
    let currentRangeStart = 0;
    let currentRangeEnd = 0;

    for (let i = 0; i < innerEmphasisRegions.length; ++i)
    {
        currentRangeStart = innerEmphasisRegions[i].range[0];
        currentRangeEnd = innerEmphasisRegions[i].range[1];
        if (currentIdx != currentRangeStart)
        {
            html += innerText.slice(currentIdx, currentRangeStart);
            currentIdx = currentRangeStart;
        }
        if (innerEmphasisRegions[i].type === "boldStart" && innerEmphasisRegions[i].count > 0)
        {
            html += `<strong>`;
        }
        else if (innerEmphasisRegions[i].type === "italicStart" && innerEmphasisRegions[i].count > 0)
        {
            html += `<em>`;
        }
        else if (innerEmphasisRegions[i].type === "boldEnd")
        {
            html += `</strong>`;
        }
        else if (innerEmphasisRegions[i].type === "italicEnd")
        {
            html += `</em>`;
        }
        currentIdx = currentRangeEnd + 1;
    }
    if (currentIdx < innerText.length -1)
    {
        html += innerText.slice(currentIdx, innerText.length - 1);
    }
    return html;
}

// for standalone emphasized text *not* nested within other markdown elements such as headers
function discoverEmphasis(mdInput)
{
    //will handle emphasized text nested in the overriding types separately
    const overridingTypes = ["link", "image", "header", "blockquote"];
    let indices = [];

    //collect all indices where standalone bold/italics exist
    for (let i = 0; i < mdInput.length; ++i)
    {
        if (mdInput[i] === "*" && !indexInExistingRegion(overridingTypes, i))
        {
            indices.push(i);
        }
        else if (mdInput[i] === "_" && !indexInExistingRegion(overridingTypes, i))
        {
            indices.push(i);
        }
    }
    //not enough to add strong or em tags
    if (indices.length <= 1)
    {
        return;
    }

    let italicOpen = false;
    let boldOpen = false;

    for (let i = 0; i < indices.length; ++i)
    {
        //bold tag region handling, but prioritize closing inner italics first
        if (indices[i + 1] - indices[i] === 1 && !italicOpen)
        {
            if (!boldOpen)
            {
                boldOpen = true;
                markerRegions.push(new markerRegion("boldStart", [indices[i], indices[i+1]], 0));
            }
            else
            {
                boldOpen = false;
                markerRegions.push(new markerRegion("boldEnd", [indices[i], indices[i+1]], 1));
                updateLastBoldStart();
            }
            ++i; //skips the next * or _, which have already been identified by the above 'if'
        }
        else
        {
            if (!italicOpen)
            {
                italicOpen = true;
                markerRegions.push(new markerRegion("italicStart", [indices[i], indices[i]], 0));
            }
            else
            {
                italicOpen = false;
                markerRegions.push(new markerRegion("italicEnd", [indices[i], indices[i]], 1));
                updateLastItalicStart();
            }
        }
    }
}

function updateLastInnerBoldStart(regions)
{
    for (let i = regions.length - 1; i >= 0; --i)
    {
        if (regions[i].type === "boldStart")
        {
            regions[i].count = 1;
            return;
        }
    }
    console.error("tried to update an inner marker region with type boldStart, but found no viable options in array");
    return;
}

function updateLastInnerItalicStart(regions)
{
    for (let i = regions.length - 1; i >= 0; --i)
    {
        if (regions[i].type === "italicStart")
        {
            regions[i].count = 1;
            return;
        }
    }
    console.error("tried to update an inner marker region with type italicStart, but found no viable options in array");
    return;
}

function updateLastBoldStart()
{
    for (let i = markerRegions.length - 1; i >= 0; --i)
    {
        if (markerRegions[i].type === "boldStart")
        {
            markerRegions[i].count = 1;
            return;
        }
    }
    console.error("tried to update a marker region with type boldStart, but found no viable options in array");
    return;
}

function updateLastItalicStart()
{
    for (let i = markerRegions.length - 1; i >= 0; --i)
    {
        if (markerRegions[i].type === "italicStart")
        {
            markerRegions[i].count = 1;
            return;
        }
    }
    console.error("tried to update a marker region with type italicStart, but found no viable options in array");
    return;
}

function markerRegion(type, range, count = 0)
{
    this.type = type;
    this.range = range;
    this.count = count;
}

markdownInput.addEventListener("input", convertMarkdown);