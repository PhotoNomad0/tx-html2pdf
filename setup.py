from setuptools import setup, find_packages
from codecs import open
from os import path

setup(
    name="tx-html2pdf",
    version="1.0.0",
    description="HTML-to-PDF conversion",
    long_description=long_description,
    url="https://github.com/unfoldingWord-dev/tx-html2pdf",
    author="unfoldingWord",
    author_email="info@door43.org",
    license="MIT",
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 2.7",
    ],
    keywords=["html", "pdf"],
    packages=find_packages(),
    install_requires=["future", "requests"],
    test_suite="tests"
)
