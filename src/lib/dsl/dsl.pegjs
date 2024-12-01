// Start Rule
start
  = task / chat / group_by / task_list

group_by =

task_list =

chat 
  = "chat" _ "to the" _ position:chat_position {
    return {
      type: "chat",
      position: position,
    }
  }

chat_position 
  = "left" / "right" {
    return text();
  }

task
  = "task" _ identifier:StringLiteral _ "with priority" _ priority:prio {
      return {
        type: "task",
        identifier: identifier,
        priority: priority,
      };
    }

// Task Components
StringLiteral
  = "\"" chars:[^"]* "\"" {
      return chars.join("");
    }

prio
  = "low" / "medium" / "high" {
      return text();
    }

// Optional Whitespace
_ = [ \t]*

