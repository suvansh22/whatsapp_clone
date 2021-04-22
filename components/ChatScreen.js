import { Avatar, Icon, IconButton } from '@material-ui/core'
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components'
import { auth, db } from '../firebase';
import MoreVerticon from '@material-ui/icons/MoreVert'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import { useCollection } from 'react-firebase-hooks/firestore';
import Message from '../components/Message'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'
import { useState, useRef, useEffect } from 'react';
import firebase from 'firebase'
import getRecipientEmail from '../utils/getRecipientEmail';
import TimeAgo from 'timeago-react';
let Picker;
if(typeof window !== 'undefined')
{
    Picker = require('emoji-picker-react').default;
}

function ChatScreen(props) {
    console.log("ASD:",Picker)
    // const endOfMessagesRef = useRef(null); // uncomment to use endOfMessageContainer
    const [emojiKeyboard,setEmojiKeyboard] = useState(false);
    const messageContainerRef = useRef(null);
    const inputRef = useRef(null)
    const {chat,messages} = props;
    const [user] = useAuthState(auth);
    const [input, setInput ] = useState("");
    const router = useRouter();
    const [messageSnapshot] = useCollection(
        db
                .collection('chats')
                .doc(router.query.id)
                .collection('messages')
                .orderBy('timestamp',"asc"));
    const recipientEmail = getRecipientEmail(chat.users,user);
    const [recipientSnapshot] = useCollection(
        db
            .collection('users')
            .where('email','==',getRecipientEmail(chat.users,user))
    );

    const showMessages = () => {
        if(messageSnapshot) {
            return messageSnapshot.docs.map(message => (
                <Message
                    key = {message.id}
                    user = {message.data().user}
                    message = {{
                        ...message.data(),
                        timestamp:message.data()?.timestamp?.toDate().getTime()
                    }}
                />
            ))
        } else {
            return JSON.parse(messages).map(message => (
                <Message key={message.d} user={message.user} message = {message}/>
            ))
        }
    }

    // const scrollToBottom = () =>{
    //     endOfMessagesRef.current.scrollIntoView({
    //         behaviour:"smooth",
    //         block:"start"
    //     });
    // }

    const scrollToBottomMessageContainer = () => {
        const scrollHeight = messageContainerRef.current.scrollHeight;
        const clientHeight = messageContainerRef.current.clientHeight;
        // endOfMessagesRef.current.offsetTop // uncomment to use endOfMessageContainer
        messageContainerRef.current.scrollTo({
                top: scrollHeight-clientHeight,
                behavior: 'smooth',
        })
        console.log("render")
    }

    const sendMessage = (e) => {
        e.preventDefault();
        //update last seen
        db.collection('users').doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge:true} )

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL:user.photoURL
        })
        setInput("");
        // scrollToBottom();
    }

    const recipient = recipientSnapshot?.docs?.[0]?.data();

    const onEmojiClick = (event, emojiObject) => {
        const newInput = input.concat(emojiObject.emoji);
        setInput(newInput);
        inputRef.current.focus();
      };

    useEffect(()=>{
        scrollToBottomMessageContainer(); //too many renders
    })

    return(
        <Container>
            <Header>
                {recipient?(
                    <Avatar src={recipient.photoURL} />
                    ):(
                        <Avatar>{recipientEmail[0]}</Avatar>
                    )
                }
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    {recipientSnapshot ? (
                        <p>Last active {''} {recipient?.lastSeen?.toDate()? (
                            <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                        ):"Unavailable"}
                        </p>
                    ): (
                        <p>Loading Last active</p>
                    )}
                </HeaderInformation>
                <HeaderIcons>
                    <IconButton>
                        <AttachFileIcon/>
                    </IconButton>
                    <IconButton>
                        <MoreVerticon/>
                    </IconButton>
                </HeaderIcons>
            </Header>
            <MessageContainer ref={messageContainerRef}>
                {showMessages()}
                {/* <EndOfMessage ref={endOfMessagesRef}/> // uncomment to use endOfMessageContainer*/} 
            </MessageContainer>
            <InputContainer>
                {
                    emojiKeyboard?(
                        <EmojiKeyboardContainer>
                            <Picker onEmojiClick={onEmojiClick}/>
                        </EmojiKeyboardContainer>
                    ):
                    null
                }
                <IconButton onClick={()=>setEmojiKeyboard(!emojiKeyboard)}>
                    <InsertEmoticonIcon />
                </IconButton>
                <Input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} />
                <button hidden disabled={!input} type="submit" onClick={sendMessage}>Send Message</button>
                <MicIcon />
            </InputContainer>
        </Container>
    )

}

export default ChatScreen;

const Container = styled.div`
    display:flex;
    flex-direction:column;
`;

const EmojiKeyboardContainer = styled.div`
    position:absolute;
    bottom:8vh;
`;

const Input = styled.input`
    flex:1;
    align-items: center;
    padding:20px;
    position: sticky;
    bottom: 0;
    background-color:whitesmoke;
    outline:none;
    border:none;
    margin-left: 15px;
    margin-right: 15px;
    border-radius: 10px;
`;

const InputContainer = styled.form`
    display:flex;
    align-items:center;
    padding:10px;
    background-color:white;
    z-index:100;
    height:8vh;
`;

const Header = styled.div`
    background-color:white;
    z-index:100;
    display:flex;
    padding:11px;
    align-items:center;
    border-bottom:1px solid whitesmoke;
    height:8vh;
`;

const MessageContainer = styled.div`
    padding:30px;
    background-color:#e5dcdB;
    min-height:84vh;
    max-height:84vh;
    overflow-y:scroll;
     ::-webkit-scrollbar {
         display:none;
     }

     -ms-overflow-style:none;
     scrollbar-width:none;
`;

// const EndOfMessage = styled.div``;   // uncomment to use endOfMessageContainer

const HeaderInformation = styled.div`
    margin-left: 15px;
    flex:1;

    > h3{
        margin-bottom:3px;
    }

    > p{
        font-size: 14px;
        color:gray;
    }
`;

const HeaderIcons = styled.div``;
