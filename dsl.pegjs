// Start Rule
start
  = task / ui

ui 
  = "chat" _ position:chat_position {
    return {
      type: "ui",
      element: "chat",
      position: position,
    }
  }

chat_position 
  = "left" / "right" {
    return text();
  }

task
  = "task" _ identifier:QuotedWords _ priority:prio {
      return {
        type: "task",
        identifier: identifier,
        priority: priority,
      };
    }

// Task Components
QuotedWords
  = '"' Words '"' {
    return text();
  }

Words
  = Word (_ Word)*

Word
  = [a-zA-Z0-9]+

prio
  = "low" / "medium" / "high" {
      return text();
    }

// Optional Whitespace
_ = [ \t]*

