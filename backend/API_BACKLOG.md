# FrontierMap API Documentation

## Backlog Management Endpoints

### Update Problem Card
**Endpoint:** `PUT /discovery/cards/{card_id}`

Update metadata for a specific problem card (status, priority, tags, assignee).

**Request Body:**
```json
{
  "status": "IN_PROGRESS",      // Optional: TODO, IN_PROGRESS, DONE, BLOCKED
  "priority": "HIGH",            // Optional: LOW, MEDIUM, HIGH, CRITICAL
  "tags": ["ai", "ml"],          // Optional: Array of strings
  "assignee": "researcher-name"  // Optional: String
}
```

**Response:**
```json
{
  "status": "updated",
  "card": {
    "_id": "card_id",
    "gap": "Research gap description",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    ...
  }
}
```

---

### Get Problem Card by ID
**Endpoint:** `GET /discovery/cards/{card_id}`

Retrieve a specific problem card by its ID.

**Response:**
```json
{
  "_id": "card_id",
  "gap": "Research gap description",
  "context": "Background information",
  "source_citation": "Paper Title",
  "proposed_solution": "Solution approach",
  "novelty_score": 8.5,
  "domain": "machine learning",
  "status": "TODO",
  "priority": "MEDIUM",
  "tags": ["ai", "research"],
  "assignee": "",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-02T00:00:00"
}
```

---

### Delete Problem Card
**Endpoint:** `DELETE /discovery/cards/{card_id}`

Delete a problem card from the backlog.

**Response:**
```json
{
  "status": "deleted",
  "id": "card_id"
}
```

---

### Get Backlog Statistics
**Endpoint:** `GET /discovery/backlog/stats`

Get statistics about all cards in the backlog.

**Response:**
```json
{
  "total_cards": 42,
  "by_status": {
    "TODO": 15,
    "IN_PROGRESS": 10,
    "DONE": 12,
    "BLOCKED": 5
  },
  "by_priority": {
    "LOW": 8,
    "MEDIUM": 20,
    "HIGH": 10,
    "CRITICAL": 4
  },
  "by_domain": {
    "machine learning": 20,
    "computer vision": 15,
    "nlp": 7
  }
}
```

---

### Get Filtered Backlog
**Endpoint:** `GET /discovery/backlog/filter`

Get filtered backlog cards based on status, priority, domain, or tags.

**Query Parameters:**
- `status` (optional): Filter by status (TODO, IN_PROGRESS, DONE, BLOCKED)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `domain` (optional): Filter by domain name
- `tags` (optional): Comma-separated list of tags (e.g., "ai,ml,nlp")

**Example Request:**
```
GET /discovery/backlog/filter?status=IN_PROGRESS&priority=HIGH
```

**Response:**
```json
{
  "cards": [
    {
      "_id": "card_id",
      "gap": "Research gap description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      ...
    }
  ],
  "count": 5
}
```

---

## Data Models

### UserProblemCard
```python
{
  "gap": str,                    # Required: The research gap description
  "context": str,                # Required: Background context
  "source_citation": str,        # Required: Source paper/discussion title
  "proposed_solution": str,      # Required: Solution approach
  "novelty_score": float,        # Required: Score from 1-10
  "domain": str,                 # Optional: Research domain (default: "")
  "is_manual": bool,             # Optional: Manually created (default: False)
  "status": str,                 # Optional: TODO, IN_PROGRESS, DONE, BLOCKED (default: "TODO")
  "priority": str,               # Optional: LOW, MEDIUM, HIGH, CRITICAL (default: "MEDIUM")
  "tags": List[str],             # Optional: List of tags (default: [])
  "assignee": str,               # Optional: Assignee name (default: "")
  "created_at": str,             # Auto-generated: ISO timestamp
  "updated_at": str              # Auto-generated: ISO timestamp
}
```

### UpdateCardRequest
```python
{
  "status": str | None,          # Optional: New status value
  "priority": str | None,        # Optional: New priority value
  "tags": List[str] | None,      # Optional: New tags list
  "assignee": str | None         # Optional: New assignee
}
```

---

## Status Workflow

Cards flow through the following states:

1. **TODO** - Initial state for new research gaps
2. **IN_PROGRESS** - Currently being investigated or worked on
3. **BLOCKED** - Blocked by dependencies or constraints
4. **DONE** - Research gap addressed or solved

## Priority Levels

- **LOW** - Nice to have, low impact
- **MEDIUM** - Normal priority (default)
- **HIGH** - Important, high impact
- **CRITICAL** - Urgent, requires immediate attention
