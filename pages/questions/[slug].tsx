import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Comment from '../../components/Comment'
import asyncForEach from '../../plugins/asyncForEach'
import upvoteQuestion from '../../plugins/upvoteQuestion'
import unUpvoteQuestion from '../../plugins/unUpvoteQuestion'
import postAnswer from '../../plugins/postAnswer'
import ReactMde from 'react-mde'
import MarkdownIt from 'markdown-it'
import 'react-mde/lib/styles/css/react-mde-all.css'
import moment from 'moment'
import { useSelector } from 'react-redux'
import uuid from 'uuid/v4'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleUp } from '@fortawesome/free-regular-svg-icons'
import { faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faArrowAltCircleUp as faArrowAltCircleUped } from '@fortawesome/free-solid-svg-icons'
import { Tooltip, message, Divider } from 'antd'
import 'antd/lib/avatar/style/index.css'
import ReactMarkdown from 'react-markdown'
import firebase from '../../plugins/firebase'
import 'firebase/firestore'

const db = firebase.firestore()

const mdParser = new MarkdownIt()

const QuestionsSlug = props => {
  const router = useRouter()
  const [answerValue, setAnswerValue] = React.useState('')
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write")
  const [isPosting, setIsPosting] = React.useState(false)
  const [isQuestionUpvoted, setIsQuestionUpvoted] = React.useState(false)
  const { question, answers } = props
  const loginUser = useSelector(state => state.loginUser)
  const isLogin = useSelector(state => state.isLogin)

  const shareUrl = `https://askmakers.co${router.asPath}`

  React.useEffect(() => {
    const checkUpvoted = async () => {
      const questionUpvoteData = await db
        .collection('questionUpvotes')
        .where('userId', '==', loginUser.uid)
        .where('questionId', '==', question.id)
        .get()
      if (questionUpvoteData.size === 0) {
        return
      }
      setIsQuestionUpvoted(true)
    }
    if (Object.keys(loginUser).length > 0) { 
      checkUpvoted()
    }
  }, [loginUser])

  const handlePostAnswer = async () => {
    setIsPosting(true)
    const id = uuid().split('-').join('')
    await postAnswer(db, loginUser, question, id, answerValue)
    setIsPosting(false)
    setAnswerValue('')
    message.success('Submitted successfully')
  }

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure to delete this answer?')) {
      return
    }
    await db
      .collection('answers')
      .doc(answerId)
      .delete()
    message.success('Deleted successfully')
    router.push('/questions/[slug]', `/questions/${question.slug}`)
  }

  const handleDeleteQuestion = async e => {
    e.preventDefault()
    if (!window.confirm('Are you sure to delete this question?')) {
      return
    }
    await db.collection('questions').doc(question.id).delete()
    router.push('/[username]', `/${loginUser.username}`)
  }

  const handleUpvoteQuestion = async e => {
    e.preventDefault()
    await upvoteQuestion(db, loginUser, question)
    setIsQuestionUpvoted(true)
  }

  const handleUnUpvoteQuestion = async e => {
    e.preventDefault()
    await unUpvoteQuestion(db, loginUser, question)
    setIsQuestionUpvoted(false)
  }

  const title = `${question.text} | AskMakers - Ask experienced makers questions`
  const url = `https://askmakers.co${router.asPath}`
  const description = 'Check out this question and post your answer!'

  return (
    <Layout>
      <Head>
        <title key="title">{title}</title>
        <meta
          key="og:title"
          property="og:title"
          content={title}
        />
        <meta key="og:site_name" property="og:site_name" content={title} />
        <meta key="og:url" property="og:url" content={url} />
        <link key="canonical" rel="canonical" href={url} />
        <meta
          key="description"
          name="description"
          content={description}
        />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
      </Head>
      <div className="w-full md:w-7/12 lg:w-7/12 mt-8 m-auto p-3">
        <div>
          <div className="flex flex-wrapper items-center mb-3">
            {!isQuestionUpvoted ?
              <Tooltip title="Upvote">
                <button onClick={handleUpvoteQuestion} className="focus:outline-none">
                  <FontAwesomeIcon icon={faArrowAltCircleUp} size="xs" className="h-6 w-6" />
                </button>
              </Tooltip> :
              <Tooltip title="Upvoted">
                <button onClick={handleUnUpvoteQuestion} className="focus:outline-none">
                  <FontAwesomeIcon icon={faArrowAltCircleUped} size="xs" className="h-6 w-6" />
                </button>
              </Tooltip>
            }
            <h1 className="text-2xl ml-2">
              {question.text}
            </h1>
          </div>
          <ul className="flex flex-wrapper items-center">
            <li className="text-gray-600 text-xs">
              Asked
              <span className="text-gray-900">
                {` ${moment.unix(question.created).fromNow()}`}
              </span>
            </li>
            <li className="ml-3">
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${question.text}`} target="_blank" className="twitter-share">
                <FontAwesomeIcon icon={faTwitter} size="xs" className="h-4 w-4" />
              </a>
            </li>
            <li className="ml-2">
              <a href={`https://www.facebook.com/share.php?u=${shareUrl}`} target="_blank" className="facebook-share">
                <FontAwesomeIcon icon={faFacebook} size="xs" className="h-4 w-4" />
              </a>
            </li>
            {question.fromUserId === loginUser.uid &&
              <>
                <li className="text-gray-600 text-xs ml-3">
                  <Link href="/edit-question/[slug]" as={`/edit-question/${question.slug}`}>
                    <a className="cursor-pointer hover:underline">
                      Edit
                    </a>
                  </Link>
                </li>
                <li className="text-gray-600 text-xs ml-3">
                  <button
                    onClick={handleDeleteQuestion}
                    className="cursor-pointer hover:underline focus:outline-none"
                  >
                    Delete
                  </button>
                </li>
              </>
            }
          </ul>
        </div>
        {question.body !== undefined &&
          <div className="mt-5">
            <ReactMarkdown source={question.body} />
            <Divider />
          </div>
        }
        {answers.length > 0 &&
        <>
          <h2 className="text-xl my-5">
            Answer
          </h2>
          {answers.map((answer, index) => (
            <div key={index}>
              <Comment handleDeleteAnswer={handleDeleteAnswer} name={answer.user.customName} userId={answer.answer.answerUserId} username={answer.user.username} picture={answer.user.picture} datetime={answer.answer.created} answer={answer.answer.content} answerId={answer.answer.id} questionSlug={question.slug} questionTitle={question.text} db={db} />
              {/* <AntCommentWrapper answerData={answer} db={db} handleDeleteAnswer={handleDeleteAnswer} questionSlug={question.slug} questionTitle={question.text} /> */}
              <Divider />
            </div>
          ))}
        </>
        }
        <h2 className="text-xl mb-5">
          Your answer
        </h2>
        {!isLogin &&
          <Link href="/login">
            <a className="font-semibold text-blue-500 pb-16">
              Please login or sign up to answer the question.
            </a>
          </Link>
        }
        {isLogin &&
        <div className="mb-3">
          <ReactMde
            value={answerValue}
            onChange={setAnswerValue}
            classes={{textArea: 'focus:outline-none'}}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={markdown =>
              Promise.resolve(mdParser.render(markdown))
            }
          />
        </div>
        }
        {isPosting && isLogin &&
          <button
            disabled
            className="text-white p-3 rounded font-medium bg-green-400 hover:bg-green-500 focus:outline-none opacity-50"
          >
            Posting…
          </button>
        }
        {answerValue === '' && !isPosting && isLogin &&
          <button
            disabled
            className="text-white p-3 rounded font-medium bg-green-400 focus:outline-none opacity-50"
          >
            Post your answer
          </button>
        }
        {answerValue !== '' && !isPosting && isLogin &&
          <button
            onClick={handlePostAnswer}
            className="text-white p-3 rounded font-medium bg-green-400 hover:bg-green-500 focus:outline-none"
          >
            Post your answer
          </button>
        }
      </div>
      <style jsx>{`
      .twitter-share {
        color: #1DA1F2;
      }
      .facebook-share {
        color: #4267B2;
      }
      `}</style>
    </Layout>
  )
}

QuestionsSlug.getInitialProps = async ({ query }) => {
  const slug = query.slug
  const questionData = await db
    .collection('questions')
    .where('slug', '==', slug)
    .get()
  const question = questionData.docs[0].data()
  const returnQuestion: IReturnQuestion = {
    created: question.created,
    text: question.text,
    id: question.id,
    slug: question.slug,
    fromUserId: question.fromUserId
  }
  if (question.body !== undefined) {
    returnQuestion.body = question.body
  }

  const answerData = await db
    .collection('answers')
    .where('questionId', '==', question.id)
    .get()
  const answers: any = []
  if (answerData.size > 0) {
    await asyncForEach(answerData.docs, async doc => {
      const answer = doc.data()
      const userData = await db
        .collection('publicUsers')
        .doc(answer.answerUserId)
        .get()
      const user = userData.data()
      const returnUser = {
        username: user.username,
        customName: user.customName,
        picture: user.picture
      }
      answers.push({
        answer,
        user: returnUser
      })
    })
  }
  return { question: returnQuestion, answers }
}

interface IReturnQuestion {
  created: number
  text: string
  id: string
  fromUserId: string
  slug: string
  body?: string
}

export default QuestionsSlug
