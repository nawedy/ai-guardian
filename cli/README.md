# AI Guardian CLI

Command-line interface for AI Guardian cybersecurity scanning.

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Scan code for vulnerabilities
```bash
./ai-guardian scan /path/to/code --language python --output results.json
```

### Apply fixes
```bash
./ai-guardian fix scan_001 --auto-apply
```

### Check service status
```bash
./ai-guardian status
```

### View configuration
```bash
./ai-guardian config
```

## Options

- `--language, -l`: Specify programming language
- `--output, -o`: Output file for results
- `--format, -f`: Output format (json, text, csv)
- `--severity, -s`: Minimum severity level
- `--auto-apply`: Automatically apply fixes

## Integration with CI/CD

The CLI tool can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run AI Guardian Scan
  run: |
    ./ai-guardian scan . --format json --output security-report.json
    ./ai-guardian fix latest --auto-apply
```

