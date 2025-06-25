# Test vulnerable Python code
password = "hardcoded_secret_123"
api_key = "sk-1234567890abcdef"

def unsafe_query(user_input):
    query = "SELECT * FROM users WHERE name = '%s'" % user_input
    return execute(query)

def render_user_content(content):
    from flask import render_template_string
    return render_template_string("<h1>" + content + "</h1>")

def process_user_code(code):
    result = eval(code)
    return result

