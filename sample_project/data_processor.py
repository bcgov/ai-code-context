#!/usr/bin/env python3
"""
Data processing utilities for the sample project.

This module provides functions for processing user data,
validating inputs, and generating reports.
"""

import json
import datetime
from typing import List, Dict, Optional


class DataProcessor:
    """Main class for processing user data."""

    def __init__(self, config_file: str = 'config.json'):
        self.config = self.load_config(config_file)
        self.processed_count = 0

    def load_config(self, config_file: str) -> Dict:
        """Load configuration from JSON file."""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {'default_setting': 'value'}

    def validate_user_data(self, user_data: Dict) -> bool:
        """Validate user data structure."""
        required_fields = ['name', 'email', 'age']

        for field in required_fields:
            if field not in user_data:
                return False

        if not isinstance(user_data['age'], int) or user_data['age'] < 0:
            return False

        return True

    def process_users(self, users: List[Dict]) -> List[Dict]:
        """Process a list of user data."""
        processed_users = []

        for user in users:
            if self.validate_user_data(user):
                processed_user = {
                    **user,
                    'processed_at': datetime.datetime.now().isoformat(),
                    'status': 'active'
                }
                processed_users.append(processed_user)
                self.processed_count += 1

        return processed_users

    def generate_report(self, processed_users: List[Dict]) -> str:
        """Generate a summary report."""
        total_users = len(processed_users)
        avg_age = sum(user['age'] for user in processed_users) / total_users if total_users > 0 else 0

        report = f"""
Data Processing Report
======================

Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Summary:
- Total users processed: {total_users}
- Average age: {avg_age:.1f}
- Processing batch size: {self.config.get('batch_size', 'N/A')}

Details:
"""

        for user in processed_users[:5]:  # Show first 5 users
            report += f"- {user['name']} ({user['email']}) - Age: {user['age']}\n"

        if total_users > 5:
            report += f"- ... and {total_users - 5} more users\n"

        return report


def main():
    """Main function for command-line usage."""
    processor = DataProcessor()

    # Sample data
    sample_users = [
        {'name': 'Alice Johnson', 'email': 'alice@example.com', 'age': 28},
        {'name': 'Bob Smith', 'email': 'bob@example.com', 'age': 34},
        {'name': 'Charlie Brown', 'email': 'charlie@example.com', 'age': 22}
    ]

    processed = processor.process_users(sample_users)
    report = processor.generate_report(processed)

    print(report)


if __name__ == '__main__':
    main()