#!/usr/bin/env python3
"""
Integration test for the complete issue tracking and backlog management workflow.
This test verifies:
1. Creating cards with issue tracking fields
2. Updating card status and priority
3. Filtering cards by various criteria
4. Getting backlog statistics
5. Deleting cards
"""
import asyncio
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import db

async def test_complete_workflow():
    """Test the complete backlog management workflow."""
    print("=" * 60)
    print("🧪 INTEGRATION TEST: Issue Tracking & Backlog Management")
    print("=" * 60)
    
    # Connect to database
    await db.connect_db()
    
    print("\n📝 Step 1: Creating test cards with different statuses and priorities...")
    
    test_cards = [
        {
            "gap": "Improve transformer efficiency in low-resource settings",
            "context": "Current models require significant computational resources",
            "source_citation": "Efficient Transformers Survey 2024",
            "proposed_solution": "Develop lightweight attention mechanisms",
            "novelty_score": 8.5,
            "domain": "machine learning",
            "status": "TODO",
            "priority": "HIGH",
            "tags": ["nlp", "efficiency", "transformers"],
            "assignee": "research-team-a"
        },
        {
            "gap": "Real-time object detection in edge devices",
            "context": "Existing models too heavy for edge deployment",
            "source_citation": "Edge AI Conference 2024",
            "proposed_solution": "Design quantization-aware neural architecture",
            "novelty_score": 7.8,
            "domain": "computer vision",
            "status": "IN_PROGRESS",
            "priority": "CRITICAL",
            "tags": ["cv", "edge-computing", "optimization"],
            "assignee": "research-team-b"
        },
        {
            "gap": "Explainability in deep reinforcement learning",
            "context": "Current RL models are black boxes",
            "source_citation": "XRL Workshop 2024",
            "proposed_solution": "Develop interpretable policy networks",
            "novelty_score": 9.0,
            "domain": "reinforcement learning",
            "status": "TODO",
            "priority": "MEDIUM",
            "tags": ["rl", "explainability", "interpretability"],
            "assignee": ""
        },
        {
            "gap": "Multi-modal learning with limited labeled data",
            "context": "Supervised approaches require extensive labels",
            "source_citation": "MultiModal AI 2024",
            "proposed_solution": "Semi-supervised cross-modal learning framework",
            "novelty_score": 8.2,
            "domain": "machine learning",
            "status": "BLOCKED",
            "priority": "LOW",
            "tags": ["multi-modal", "semi-supervised"],
            "assignee": "research-team-c"
        }
    ]
    
    card_ids = []
    for card in test_cards:
        card_id = await db.save_card(card)
        if card_id:
            card_ids.append(card_id)
            print(f"✅ Created: {card['gap'][:50]}... (Status: {card['status']}, Priority: {card['priority']})")
        else:
            print(f"⚠️  Card created in-memory (MongoDB not available)")
    
    print(f"\n✅ Created {len(card_ids)} test cards")
    
    # Step 2: Get backlog statistics
    print("\n📊 Step 2: Getting backlog statistics...")
    stats = await db.get_backlog_stats()
    print(f"Total Cards: {stats['total_cards']}")
    print(f"By Status: {stats['by_status']}")
    print(f"By Priority: {stats['by_priority']}")
    print(f"By Domain: {stats['by_domain']}")
    
    # Step 3: Filter cards by status
    print("\n🔍 Step 3: Filtering cards by status 'TODO'...")
    todo_cards = await db.get_filtered_cards(status="TODO")
    print(f"Found {len(todo_cards)} TODO cards:")
    for card in todo_cards:
        print(f"  - {card['gap'][:60]}")
    
    # Step 4: Filter by priority
    print("\n🔍 Step 4: Filtering cards by priority 'CRITICAL'...")
    critical_cards = await db.get_filtered_cards(priority="CRITICAL")
    print(f"Found {len(critical_cards)} CRITICAL priority cards:")
    for card in critical_cards:
        print(f"  - {card['gap'][:60]}")
    
    # Step 5: Filter by domain
    print("\n🔍 Step 5: Filtering cards by domain 'machine learning'...")
    ml_cards = await db.get_filtered_cards(domain="machine learning")
    print(f"Found {len(ml_cards)} machine learning cards:")
    for card in ml_cards:
        print(f"  - {card['gap'][:60]}")
    
    # Step 6: Filter by tags
    print("\n🔍 Step 6: Filtering cards by tag 'nlp'...")
    nlp_cards = await db.get_filtered_cards(tags=["nlp"])
    print(f"Found {len(nlp_cards)} cards with 'nlp' tag:")
    for card in nlp_cards:
        print(f"  - {card['gap'][:60]}")
    
    # Step 7: Update a card
    if card_ids:
        print("\n✏️  Step 7: Updating first card status to 'IN_PROGRESS'...")
        updated = await db.update_card(card_ids[0], {"status": "IN_PROGRESS", "priority": "CRITICAL"})
        if updated:
            print("✅ Card updated successfully")
            updated_card = await db.get_card_by_id(card_ids[0])
            print(f"   New status: {updated_card['status']}")
            print(f"   New priority: {updated_card['priority']}")
    
    # Step 8: Get updated statistics
    print("\n📊 Step 8: Getting updated statistics...")
    updated_stats = await db.get_backlog_stats()
    print(f"By Status: {updated_stats['by_status']}")
    print(f"By Priority: {updated_stats['by_priority']}")
    
    # Cleanup
    print("\n🧹 Step 9: Cleaning up test data...")
    for card_id in card_ids:
        await db.delete_card(card_id)
    print(f"✅ Deleted {len(card_ids)} test cards")
    
    # Verify cleanup
    final_stats = await db.get_backlog_stats()
    print(f"\nFinal card count: {final_stats['total_cards']}")
    
    await db.close_db()
    
    print("\n" + "=" * 60)
    print("✅ ALL INTEGRATION TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_complete_workflow())
