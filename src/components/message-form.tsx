import { SendHorizontal } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "./ui/button";

export default function MessageForm() {
    return(
        <form className="grow-0 flex gap-3">
            <Textarea />
            <Button><SendHorizontal /></Button>
        </form>
    )
}