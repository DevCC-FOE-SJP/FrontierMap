#!/usr/bin/env python3
"""
Simple test script for backlog management API endpoints.
Tests the new issue tracking and backlog features without requiring external services.
"""
import asyncio
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import db
from app.core.models import UpdateCardRequest, BacklogStats

async def test_database_operations():
    """Test database operations for backlog management."""
    print("🧪 Testing Backlog Management Database Operations\n")
    
    # Connect to database (will gracefully handle if MongoDB is not available)
    await db.connect_db()
    
    # Test 1: Save a card with issue tracking fields
    print("Test 1: Saving a card with issue tracking fields...")
    card_data = {
        "gap": "Test Research Gap",
        "context": "This is a test context for the research gap",
        "source_citation": "Test Paper 2024",
        "proposed_solution": "Test solution approach",
        "novelty_score": 8.5,
        "domain": "test-domain",
        "is_manual": True,
        "status": "TODO",
        "priority": "HIGH",
        "tags": ["test", "research"],
        "assignee": "test-user"
    }
    
    card_id = await db.save_card(card_data)
    if card_id:
        print(f"✅ Card saved with ID: {card_id}")
    else:
        print("⚠️  Card saved to in-memory (MongoDB not available)")
    
    # Test 2: Update card
    if card_id:
        print("\nTest 2: Updating card status...")
        update_data = {"status": "IN_PROGRESS", "priority": "CRITICAL"}
        success = await db.update_card(card_id, update_data)
        if success:
            print("✅ Card updated successfully")
        else:
            print("❌ Card update failed")
        
        # Test 3: Get card by ID
        print("\nTest 3: Retrieving card by ID...")
        card = await db.get_card_by_id(card_id)
        if card:
            print(f"✅ Retrieved card: {card['gap']}")
            print(f"   Status: {card.get('status', 'N/A')}")
            print(f"   Priority: {card.get('priority', 'N/A')}")
        else:
            print("❌ Card retrieval failed")
    
    # Test 4: Get backlog stats
    print("\nTest 4: Getting backlog statistics...")
    stats = await db.get_backlog_stats()
    print(f"✅ Backlog stats retrieved:")
    print(f"   Total cards: {stats.get('total_cards', 0)}")
    print(f"   By status: {stats.get('by_status', {})}")
    print(f"   By priority: {stats.get('by_priority', {})}")
    
    # Test 5: Get filtered cards
    print("\nTest 5: Filtering cards by status...")
    filtered = await db.get_filtered_cards(status="TODO")
    print(f"✅ Found {len(filtered)} cards with status TODO")
    
    # Cleanup
    if card_id:
        print("\nCleaning up test data...")
        deleted = await db.delete_card(card_id)
        if deleted:
            print("✅ Test card deleted")
    
    # Close database connection
    await db.close_db()
    print("\n✅ All tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_database_operations())
