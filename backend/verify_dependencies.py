#!/usr/bin/env python3
"""
Dependency verification script for AI Guardian backend services.
This script verifies that all required packages can be imported successfully.
"""

import sys
import importlib
from typing import List, Tuple


def test_import(module_name: str) -> Tuple[bool, str]:
    """Test if a module can be imported successfully."""
    try:
        importlib.import_module(module_name)
        return True, f"✅ {module_name}"
    except ImportError as e:
        return False, f"❌ {module_name}: {str(e)}"
    except Exception as e:
        return False, f"⚠️  {module_name}: {str(e)}"


def verify_core_dependencies() -> List[Tuple[bool, str]]:
    """Verify core Flask and web framework dependencies."""
    modules = [
        'flask',
        'flask_cors',
        'flask_sqlalchemy',
        'werkzeug',
        'jinja2',
        'markupsafe',
        'itsdangerous',
        'blinker',
        'click'
    ]
    return [test_import(module) for module in modules]


def verify_database_dependencies() -> List[Tuple[bool, str]]:
    """Verify database-related dependencies."""
    modules = [
        'sqlalchemy',
        'greenlet',
        'peewee'
    ]
    return [test_import(module) for module in modules]


def verify_network_dependencies() -> List[Tuple[bool, str]]:
    """Verify networking and HTTP dependencies."""
    modules = [
        'requests',
        'urllib3',
        'certifi',
        'charset_normalizer',
        'idna',
        'websockets'
    ]
    return [test_import(module) for module in modules]


def verify_security_dependencies() -> List[Tuple[bool, str]]:
    """Verify security and code analysis dependencies."""
    modules = [
        'bandit',
        'yaml',  # PyYAML
    ]
    return [test_import(module) for module in modules]


def verify_ml_dependencies() -> List[Tuple[bool, str]]:
    """Verify machine learning dependencies."""
    modules = [
        'numpy',
        'sklearn',  # scikit-learn
        'scipy',
        'joblib'
    ]
    return [test_import(module) for module in modules]


def verify_utility_dependencies() -> List[Tuple[bool, str]]:
    """Verify utility and data processing dependencies."""
    modules = [
        'attrs',
        'colorama',
        'packaging',
        'pygments',
        'rich',
        'typing_extensions'
    ]
    return [test_import(module) for module in modules]


def verify_standard_library() -> List[Tuple[bool, str]]:
    """Verify standard library modules that should always be available."""
    modules = [
        'os',
        'sys',
        'json',
        'datetime',
        'hashlib',
        're',
        'ast',
        'threading',
        'time',
        'tempfile',
        'subprocess',
        'sqlite3',
        'asyncio',
        'logging'
    ]
    return [test_import(module) for module in modules]


def main():
    """Main verification function."""
    print("🔍 AI Guardian Backend Dependency Verification")
    print("=" * 50)
    
    all_results = []
    
    categories = [
        ("Standard Library", verify_standard_library),
        ("Core Flask & Web", verify_core_dependencies),
        ("Database", verify_database_dependencies),
        ("Network & HTTP", verify_network_dependencies),
        ("Security & Analysis", verify_security_dependencies),
        ("Machine Learning", verify_ml_dependencies),
        ("Utilities", verify_utility_dependencies)
    ]
    
    for category_name, verify_func in categories:
        print(f"\n📦 {category_name}")
        print("-" * 30)
        
        results = verify_func()
        all_results.extend(results)
        
        for success, message in results:
            print(f"  {message}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    successful = sum(1 for success, _ in all_results if success)
    total = len(all_results)
    failed = total - successful
    
    print(f"✅ Successful imports: {successful}/{total}")
    if failed > 0:
        print(f"❌ Failed imports: {failed}/{total}")
        print("\n🚨 DEPLOYMENT ISSUES DETECTED!")
        print("The following packages are missing or have import errors:")
        for success, message in all_results:
            if not success:
                print(f"  {message}")
        sys.exit(1)
    else:
        print("🎉 All dependencies verified successfully!")
        print("✅ Backend is ready for deployment!")


if __name__ == "__main__":
    main() 