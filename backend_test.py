#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SportWissenAPITester:
    def __init__(self, base_url="https://sport-teaching.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, expected_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Check response content if expected_keys provided
                if expected_keys:
                    try:
                        response_data = response.json()
                        for key in expected_keys:
                            if key not in response_data:
                                print(f"⚠️  Warning: Expected key '{key}' not found in response")
                            else:
                                print(f"   ✓ Found expected key: {key}")
                    except json.JSONDecodeError:
                        print(f"⚠️  Warning: Response is not valid JSON")
                
                return True, response.json() if response.content else {}
            else:
                self.tests_passed += 1 if response.status_code in [200, 201, 204] else 0
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_data = response.json()
                        print(f"   Error details: {error_data}")
                    except:
                        print(f"   Response text: {response.text[:200]}...")
                
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200] if response.content else 'No content'
                })
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'expected': expected_status,
                'actual': 'Network Error',
                'error': str(e)
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'expected': expected_status,
                'actual': 'Exception',
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200,
            expected_keys=["message", "version"]
        )

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET", 
            "api/health",
            200,
            expected_keys=["status"]
        )

    def test_get_phases(self):
        """Test phases endpoint"""
        success, response = self.run_test(
            "Get Phases",
            "GET",
            "api/phases",
            200,
            expected_keys=["phases", "correct_order"]
        )
        
        if success and response:
            phases = response.get('phases', [])
            correct_order = response.get('correct_order', [])
            print(f"   Found {len(phases)} phases")
            print(f"   Correct order has {len(correct_order)} items")
            
            # Validate phase structure
            for i, phase in enumerate(phases):
                required_keys = ['id', 'name', 'order']
                missing_keys = [key for key in required_keys if key not in phase]
                if missing_keys:
                    print(f"   ⚠️  Phase {i+1} missing keys: {missing_keys}")
                else:
                    print(f"   ✓ Phase {i+1}: {phase['name']}")
        
        return success, response

    def test_validate_phases(self):
        """Test phase validation endpoint"""
        # First get the correct order
        success, phases_data = self.test_get_phases()
        if not success:
            return False, {}
        
        correct_order = phases_data.get('correct_order', [])
        if not correct_order:
            print("   ⚠️  No correct order found, using fallback")
            correct_order = ["phase_1", "phase_2", "phase_3", "phase_4"]
        
        # Test with correct order
        success, response = self.run_test(
            "Validate Phases (Correct Order)",
            "POST",
            "api/validate-phases",
            200,
            data=correct_order,
            expected_keys=["is_correct", "message"]
        )
        
        if success and response:
            is_correct = response.get('is_correct', False)
            message = response.get('message', '')
            print(f"   Validation result: {is_correct}")
            print(f"   Message: {message}")
        
        # Test with wrong order
        wrong_order = correct_order[::-1]  # Reverse the order
        success2, response2 = self.run_test(
            "Validate Phases (Wrong Order)",
            "POST",
            "api/validate-phases",
            200,
            data=wrong_order,
            expected_keys=["is_correct", "message", "correct_order"]
        )
        
        return success and success2, response

    def test_technik_merkmale(self):
        """Test technique characteristics endpoint"""
        success, response = self.run_test(
            "Get Technik Merkmale",
            "GET",
            "api/technik/merkmale",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} technique characteristics")
            for i, merkmal in enumerate(response):
                if 'id' in merkmal and 'text' in merkmal:
                    print(f"   ✓ Merkmal {i+1}: {merkmal['text'][:50]}...")
                else:
                    print(f"   ⚠️  Merkmal {i+1} missing required fields")
        
        return success, response

    def test_technik_bilder(self):
        """Test technique images endpoint"""
        return self.run_test(
            "Get Technik Bilder",
            "GET",
            "api/technik/bilder",
            200
        )

    def test_videos(self):
        """Test videos endpoint"""
        success, response = self.run_test(
            "Get Videos",
            "GET",
            "api/videos",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} videos")
            categories = set()
            for i, video in enumerate(response):
                if 'id' in video and 'title' in video and 'category' in video:
                    categories.add(video['category'])
                    print(f"   ✓ Video {i+1}: {video['title']} ({video['category']})")
                else:
                    print(f"   ⚠️  Video {i+1} missing required fields")
            
            print(f"   Categories found: {list(categories)}")
        
        return success, response

    def test_videos_by_category(self):
        """Test videos by category endpoint"""
        # Test with known categories
        categories = ["angleiten", "stoss", "gesamt"]
        all_success = True
        
        for category in categories:
            success, response = self.run_test(
                f"Get Videos by Category ({category})",
                "GET",
                f"api/videos/{category}",
                200
            )
            all_success = all_success and success
            
            if success and isinstance(response, list):
                print(f"   Found {len(response)} videos in category '{category}'")
        
        return all_success, {}

    def test_quiz_questions(self):
        """Test quiz questions endpoint"""
        success, response = self.run_test(
            "Get Quiz Questions",
            "GET",
            "api/quiz",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} quiz questions")
            for i, question in enumerate(response):
                required_keys = ['id', 'question', 'options', 'correct_index']
                missing_keys = [key for key in required_keys if key not in question]
                if missing_keys:
                    print(f"   ⚠️  Question {i+1} missing keys: {missing_keys}")
                else:
                    print(f"   ✓ Question {i+1}: {question['question'][:50]}...")
        
        return success, response

    def test_info_cards(self):
        """Test info cards endpoint"""
        success, response = self.run_test(
            "Get Info Cards",
            "GET",
            "api/info-cards",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} info cards")
            for i, card in enumerate(response):
                if 'id' in card and 'title' in card and 'items' in card:
                    print(f"   ✓ Card {i+1}: {card['title']} ({len(card['items'])} items)")
                else:
                    print(f"   ⚠️  Card {i+1} missing required fields")
        
        return success, response

def main():
    print("🚀 Starting SportWissen Kugelstoßen API Tests")
    print("=" * 60)
    
    tester = SportWissenAPITester()
    
    # Run all tests
    test_methods = [
        tester.test_root_endpoint,
        tester.test_health_check,
        tester.test_get_phases,
        tester.test_validate_phases,
        tester.test_technik_merkmale,
        tester.test_technik_bilder,
        tester.test_videos,
        tester.test_videos_by_category,
        tester.test_quiz_questions,
        tester.test_info_cards,
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test {test_method.__name__} failed with exception: {e}")
            tester.failed_tests.append({
                'name': test_method.__name__,
                'endpoint': 'unknown',
                'expected': 'success',
                'actual': 'exception',
                'error': str(e)
            })
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary")
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(tester.failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['name']}")
            print(f"   Endpoint: {test['endpoint']}")
            print(f"   Expected: {test['expected']}, Got: {test['actual']}")
            print(f"   Error: {test['error']}")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())