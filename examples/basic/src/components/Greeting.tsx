interface GreetingProps {
    name: string
}

export function Greeting(props: GreetingProps): string {
    return `<p>Hello, ${props.name}!</p>`
}
