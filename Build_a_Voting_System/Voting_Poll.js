let poll = new Map();

const addOption = (option) => {
  if (Object.keys(option).length === 0)
  {
    return `Option cannot be empty`;
  }
  if (!poll.has(option))
  {
    poll.set(option, new Set());
    return `Option ${option} added to the poll`;
  }
  else
  {
    return `Option ${option} already exists`;
  }
}

const vote = (option, voterId) => {
    if (!poll.has(option))
    {
        return `Option ${option} does not exist.`;
    }
    else
    {
        const voterIds = poll.get(option);
        if (voterIds.has(voterId))
        {
            return `Voter ${voterId} has already voted for ${option}`;
        }
        else
        {
            voterIds.add(voterId);
            return `Voter ${voterId} voted for "${option}".`;
        }
    }
}

const displayResults = () => {
    let resultText = `Poll Results:\n`;
    poll.keys.forEach(key => {
        resultText += `key: ${poll.get(key).size} votes\n`;
    })
    return resultText;
}