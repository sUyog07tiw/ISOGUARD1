import os
from openai import AzureOpenAI
from dotenv import load_dotenv


def create_azure_client() -> AzureOpenAI:
    """Instantiate the Azure OpenAI client using .env credentials."""
    load_dotenv()
    api_key = os.getenv("AZURE_OPENAI_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_DEPLOYMENT")

    if not api_key or not endpoint or not deployment:
        raise EnvironmentError("Azure OpenAI credentials are not configured.")

    return AzureOpenAI(
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version="2024-12-01-preview"
    )


def run_sample_prompt(client: AzureOpenAI, deployment: str) -> None:
    """Submit a short chat prompt and print the assistant's reply."""
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {
                "role": "user",
                "content": "I am going to Paris, what should I see?",
            }
        ],
        max_completion_tokens=16384,
        model=deployment
    )

    print(response.choices[0].message.content)


def main() -> None:
    client = create_azure_client()
    deployment = os.getenv("AZURE_DEPLOYMENT")
    assert deployment, "Azure deployment name is required"
    run_sample_prompt(client, deployment)


if __name__ == "__main__":
    main()