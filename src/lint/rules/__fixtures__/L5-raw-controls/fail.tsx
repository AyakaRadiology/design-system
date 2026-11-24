export function Form() {
    return (
        <form>
            <input name="q" />
            <select name="mode" />
            <textarea name="notes" rows={5} />
            <button type="button">go</button>
            <dialog open />
        </form>
    );
}
