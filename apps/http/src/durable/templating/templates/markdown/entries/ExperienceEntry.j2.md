## {{ entry.main_column_lines[0] }}

{% for line in entry.date_and_location_column_lines %}
{{ line }}

{% endfor %}
{% for line in entry.main_column_lines[1:] %}
{%- if line != "!!! summary" -%}{{ line|replace("    ", "") }}

{% endif -%}
{% endfor %}
