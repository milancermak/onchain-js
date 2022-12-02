#!/usr/bin/env python

import base64
import gzip
from string import Template

import click
from more_itertools import sliced


def str_to_felt(text: str) -> int:
    b_text = bytes(text, "ascii")
    return int.from_bytes(b_text, "big")


def prepare_code(code_file):
    "Compress and base64 encode contents of a file"
    with open(code_file, "rb") as cf:
        scheme = b"data:text/javascript;base64,"
        code = base64.b64encode(cf.read())
        return base64.b64encode(gzip.compress(scheme + code))


@click.command()
@click.option("--code-file", help="Path to a JS file you want to wrap into Cairo")
@click.option("--func-name")
@click.option("--output-file")
@click.option("--template-file", default="cairo_code_func.template", help="Path to a template file for producing final .cairo contract")
def main(code_file, template_file, func_name, output_file):
    with open(template_file) as tf, open(output_file, "w") as of:
        code = prepare_code(code_file)
        code_chunks = sliced(code, 31)
        code_felts = [f"{int.from_bytes(c, 'big')}" for c in code_chunks]
        code_str = ",\n        ".join(code_felts) # extra spaces so the cairo code looks tidy
        template = Template(tf.read())
        of.write(template.substitute(func_name=func_name, code=code_str, code_len=len(code_felts)))
        print("len: ", len(code_felts))


if __name__ == "__main__":
    main()
