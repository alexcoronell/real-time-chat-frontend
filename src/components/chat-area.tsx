import MessageForm from './message-form';

export default function ChatArea() {
  return (
    <div className='bg-muted/50 rounded-xl grow border p-6 flex flex-col gap-3'>
      <div className='grow'></div>
      <MessageForm />
    </div>
  );
}
