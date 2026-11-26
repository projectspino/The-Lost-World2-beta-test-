export class DialogueSystem {
  constructor() {
    this.dialogues = new Map();
    this.currentDialogue = null;
    this.currentNode = null;
  }

  registerNPC(npcId, dialogueData) {
    if (!npcId || !dialogueData || !dialogueData.start) {
      return false;
    }

    this.dialogues.set(npcId, dialogueData);
    return true;
  }

  startDialogue(npcId) {
    const dialogue = this.dialogues.get(npcId);

    if (!dialogue) {
      return null;
    }

    this.currentDialogue = dialogue;
    this.currentNode = dialogue.start;

    return this.getCurrentNode();
  }

  getCurrentNode() {
    if (!this.currentDialogue || !this.currentNode) {
      return null;
    }

    const node = this.currentDialogue.nodes?.[this.currentNode];

    if (!node) {
      this.endDialogue();
      return null;
    }

    return {
      speaker: node.speaker ?? "NPC",
      text: node.text ?? "",
      choices: (node.choices ?? []).map(choice => ({
        text: choice.text,
        next: choice.next
      }))
    };
  }

  choose(index) {
    const node = this.currentDialogue?.nodes?.[this.currentNode];

    if (!node || !Array.isArray(node.choices)) {
      return null;
    }

    const choice = node.choices[index];

    if (!choice) {
      return null;
    }

    if (!choice.next) {
      this.endDialogue();
      return null;
    }

    this.currentNode = choice.next;
    return this.getCurrentNode();
  }

  endDialogue() {
    this.currentDialogue = null;
    this.currentNode = null;
  }

  isActive() {
    return this.currentDialogue !== null;
  }
}
