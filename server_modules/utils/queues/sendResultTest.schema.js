export const sendResultTest = {
    "type": "object",
    "properties": {
      "idUser": { "type": "string" },
      "idProblem": { "type": "string" },
      "code": { "type": "string" },
      "groupsTests": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "group": { "type": "number" },
            "testBal": { "type": "number" },
            "testCount": { "type": "number" },
            "tests": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": { "type": "string" },
                  "bal": { "type": "number" },
                  "time": { "type": "number" },
                  "result": { "type": "boolean" }
                },
                "required": ["id", "bal", "time", "result"]
              }
            },
            "scored": { "type": "number" }
          },
          "required": ["group", "testBal", "testCount", "tests", "scored"]
        }
      }
    },
    "required": ["idUser", "idProblem", "code", "groupsTests"]
  }
  