import React from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import FeaturedMaker from '../components/FeaturedMaker'
import WelcomeBox from '../components/WelcomeBox'
import QuestionWrapper from '../components/QuestionWrapper'
import RecentAnswer from '../components/RecentAnswer'
import asyncForEach from '../plugins/asyncForEach'
import firebase from '../plugins/firebase'
import 'firebase/firestore'

const db = firebase.firestore()

const Home: NextPage<Props> = props => {
  const { questions } = props
  const [quesionsContainer, setQuesionsContainer] = React.useState(questions)
  const [lastQuestion, setLastQuestion] = React.useState<ISingleQuestion>()

  React.useEffect(() => {
    setLastQuestion(quesionsContainer[quesionsContainer.length - 1].question)
  }, [quesionsContainer])

  const loadQuestions = async e => {
    e.preventDefault()
    const quesionsContainerCopy = quesionsContainer.concat()
    console.log({quesionsContainerCopy})
    const questionData = await db
      .collection('questions')
      .where('isGeneral', '==', true)
      .orderBy('created', 'desc')
      .startAfter(lastQuestion.created)
      .limit(10)
      .get()
    await asyncForEach(questionData.docs, async doc => {
      const question = doc.data()
      const [userData, answerData, upvoteData] = await Promise.all([
        db
          .collection('publicUsers')
          .doc(question.fromUserId)
          .get(),
        db
          .collection('answers')
          .where('questionId', '==', question.id)
          .get(),
        db
          .collection('questionUpvotes')
          .where('questionId', '==', question.id)
          .get()
      ])
      const user = userData.data()
      question.answerCount = answerData.size
      question.questionUpvoteCount = upvoteData.size
      quesionsContainerCopy.push({ question, user })
    })
    setQuesionsContainer(quesionsContainerCopy)
  }

  return (
    <Layout>
      <Hero />
      <div className="mt-5 mb-10">
        <div className="px-3 w-full md:w-9/12 lg:w-9/12 m-auto flex flex-wrap">
          <div className="w-full mb-5 md:w-8/12 lg:w-8/12 md:pr-5 lg:pr-5">
            {quesionsContainer.map((question, index) => (
              <QuestionWrapper question={question} key={index} />
            ))}
            {/* <button onClick={loadQuestions}>Load more</button> */}
          </div>
          <aside className="w-full md:w-4/12 lg:w-4/12">
            <WelcomeBox class="border border-gray-300 rounded p-3 mb-5" />
            <FeaturedMaker class="rounded mb-5" />
            <RecentAnswer />
            <div className="text-xs text-gray-600">
              <div className="mb-3">
                <Link href="/">
                  <a>
                    AskMakers
                  </a>
                </Link>
                , made by Taishi Kato Ⓒ 2020
              </div>
              <Link href="/terms-privacy">
                <a>
                  Terms of Service & Privacy
                </a>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

Home.getInitialProps = async () => {
  const questionData = await db
    .collection('questions')
    .where('isGeneral', '==', true)
    .orderBy('created', 'desc')
    .limit(10)
    .get()
  const questions: any = []
  await asyncForEach(questionData.docs, async doc => {
    const question = doc.data()
    const [userData, answerData, upvoteData] = await Promise.all([
      db
        .collection('publicUsers')
        .doc(question.fromUserId)
        .get(),
      db
        .collection('answers')
        .where('questionId', '==', question.id)
        .get(),
      db
        .collection('questionUpvotes')
        .where('questionId', '==', question.id)
        .get()
    ])
    const user = userData.data()
    question.answerCount = answerData.size
    question.questionUpvoteCount = upvoteData.size
    questions.push({ question, user })
  })
  return { questions }
}

interface Props {
  questions: any
}

interface ISingleQuestion {
  created: number
  fromUserId: string
  id: string
  image: string
  isAnswered: boolean
  isGeneral: boolean
  slug: string
  text: string
  topics: {}
  answerCount: number
  questionUpvoteCount: number
}

export default Home
