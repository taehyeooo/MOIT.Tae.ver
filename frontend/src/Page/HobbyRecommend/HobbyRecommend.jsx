import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- 데이터 영역 ---
const hobbyDatabase = [
  // 6.내향(1)/외향(5) 7.안정(1)/모험(5) 8.계획(5)/즉흥(1) 9.규칙(1)/창의(5) 10.성장(5)/과정(1) 11.정적(1)/동적(5) 12.수익화(5)/순수(1) 13.오프라인(1)/온라인(5) 14.전문성(1)/다양성(5) 15.목표(1)/즐거움(5)
  { name: '밴드 합주', category: '음악', description: '동료들과 함께 음악을 만들며 스트레스를 해소하세요.', tags: ['실내', '팀 활동', '고비용'], scores: { social: 5, spontaneity: 4, planning: 2, creativity: 4, growth: 3, energy: 4, business: 3, online: 2, depth: 4, fun: 5 } },
  { name: '코딩 동아리', category: 'IT', description: '함께 문제를 해결하고 새로운 기술을 배우는 즐거움', tags: ['실내', '팀 활동', '저비용'], scores: { social: 4, spontaneity: 2, planning: 5, creativity: 4, growth: 5, energy: 1, business: 4, online: 3, depth: 5, fun: 2 } },
  { name: '등산', category: '운동', description: '자연 속에서 정상에 오르는 성취감을 느껴보세요.', tags: ['실외', '체력', '저비용'], scores: { social: 2, spontaneity: 3, planning: 4, creativity: 1, growth: 4, energy: 5, business: 1, online: 1, depth: 4, fun: 2 } },
  { name: '클라이밍', category: '운동', description: '전신 근육을 사용하는 도전적인 실내 스포츠', tags: ['실내', '체력', '중비용'], scores: { social: 3, spontaneity: 4, planning: 3, creativity: 2, growth: 5, energy: 5, business: 1, online: 1, depth: 5, fun: 2 } },
  { name: '온라인 게임', category: '게임', description: '가상 세계에서 친구들과 함께 미션을 수행하세요.', tags: ['실내', '팀 활동', '저비용'], scores: { social: 5, spontaneity: 5, planning: 2, creativity: 2, growth: 4, energy: 1, business: 2, online: 5, depth: 4, fun: 5 } },
  { name: '콘솔 게임', category: '게임', description: '혼자 깊이 있는 스토리에 몰입하는 시간을 가져보세요.', tags: ['실내', '솔로', '고비용'], scores: { social: 1, spontaneity: 4, planning: 2, creativity: 1, growth: 2, energy: 1, business: 1, online: 4, depth: 5, fun: 5 } },
  { name: '베이킹', category: '요리', description: '레시피를 따라 달콤한 결과물을 만들어내는 기쁨', tags: ['실내', '저비용', '선물'], scores: { social: 2, spontaneity: 2, planning: 5, creativity: 3, growth: 3, energy: 2, business: 3, online: 2, depth: 4, fun: 3 } },
  { name: '유화 그리기', category: '미술', description: '나만의 스타일로 캔버스에 세상을 담아보세요.', tags: ['실내', '솔로', '고비용'], scores: { social: 1, spontaneity: 3, planning: 4, creativity: 5, growth: 4, energy: 1, business: 3, online: 1, depth: 5, fun: 2 } },
  { name: '블로그/SNS', category: '창작', description: '자신만의 콘텐츠로 세상과 소통하고 영향력을 키워보세요.', tags: ['온라인', '저비용'], scores: { social: 3, spontaneity: 4, planning: 3, creativity: 5, growth: 4, energy: 1, business: 5, online: 5, depth: 3, fun: 3 } },
  { name: 'OTT 시리즈 정주행', category: '휴식', description: '편안하게 즐기는 몰입의 시간', tags: ['실내', '솔로', '저비용'], scores: { social: 1, spontaneity: 5, planning: 1, creativity: 1, growth: 1, energy: 1, business: 1, online: 3, depth: 2, fun: 5 } },
];
const part1Questions = [
    { id: 'age', text: '1. 연령대를 선택해 주세요.', options: ['10대', '20대', '30대', '40대', '50대 이상'] },
    { id: 'gender', text: '2. 성별을 선택해 주세요.', options: ['남성', '여성', '선택 안 함'] },
    { id: 'job', text: '3. 현재 어떤 일을 하고 계신가요?', options: ['학생', '직장인', '프리랜서', '주부', '구직자', '기타'] },
    { id: 'time', text: '4. 일주일에 온전히 나를 위해 사용할 수 있는 시간은 어느 정도인가요?', options: ['3시간 미만', '3~5시간', '5~10시간', '10시간 이상'] },
    { id: 'budget', text: '5. 한 달에 취미 활동을 위해 얼마까지 지출할 수 있나요?', options: ['5만원 미만', '5~10만원', '10~20만원', '20만원 이상'] },
];
const part2Questions = [
    { id: 'social', text: '6. 새로운 사람들과 어울리기보다, 혼자 또는 가까운 친구와 깊이 있는 시간을 보내는 것을 선호합니다.' },
    { id: 'spontaneity', text: '7. 반복적인 일상에 안정감을 느끼기보다, 예측 불가능한 새로운 경험을 통해 영감을 얻는 편입니다.' },
    { id: 'planning', text: '8. 즉흥적으로 행동하기보다, 명확한 목표를 세우고 계획에 따라 꾸준히 실행하는 것에서 성취감을 느낍니다.' },
    { id: 'creativity', text: '9. 정해진 규칙을 따르기보다, 나만의 방식과 스타일을 더해 독창적인 결과물을 만드는 것을 즐깁니다.' },
    { id: 'growth', text: '10. 과정 자체를 즐기는 것도 좋지만, 꾸준한 연습을 통해 실력이 향상되는 것을 눈으로 확인할 때 가장 큰 보람을 느낍니다.' },
    { id: 'energy', text: '11. 하루의 스트레스를 조용히 생각하며 풀기보다, 몸을 움직여 땀을 흘리며 해소하는 것을 선호합니다.' },
    { id: 'business', text: '12. 취미 활동을 통해 새로운 수익을 창출하거나, SNS에서 영향력을 키우는 것에 관심이 많습니다.' },
    { id: 'online', text: '13. 오프라인에서 직접 만나 교류하는 것만큼, 온라인 커뮤니티에서 소통하는 것에서도 강한 소속감을 느낍니다.' },
    { id: 'depth', text: '14. 하나의 취미를 깊게 파고드는 전문가가 되기보다, 다양한 분야를 경험해보는 제너럴리스트가 되고 싶습니다.' },
    { id: 'fun', text: '15. 이 취미를 통해 \'무엇을 얻을 수 있는가\'보다 \'그 순간이 얼마나 즐거운가\'가 더 중요합니다.' },
];
const popularHobbies = [
    { rank: 1, name: '게임', category: '취미', recommendations: '10회 추천' },
    { rank: 2, name: '독서', category: '학습', recommendations: '10회 추천' },
    { rank: 3, name: '요가', category: '운동', recommendations: '9회 추천' },
    { rank: 4, name: '요리', category: '생활', recommendations: '9회 추천' },
    { rank: 5, name: '농구', category: '운동', recommendations: '8회 추천' },
    { rank: 6, name: '등산', category: '운동', recommendations: '8회 추천' },
];

// --- 컴포넌트 영역 ---
const LoginPrompt = () => (
    <div className="text-center bg-white p-12 rounded-lg shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">로그인이 필요한 서비스입니다.</h2>
        <p className="text-gray-600 mb-8">
            MOIT의 맞춤 취미 추천을 받으려면 로그인을 해주세요!
        </p>
        <Link
            to="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
            로그인 페이지로 이동
        </Link>
    </div>
);

const Part1 = ({ answers, onAnswer }) => (
    <div className="space-y-8 mb-16">
        {part1Questions.map(q => (
            <div key={q.id}>
                <h3 className="text-lg font-semibold mb-3">{q.text}</h3>
                <div className="flex flex-wrap gap-3">
                    {q.options.map(opt => (
                        <button key={opt} onClick={() => onAnswer(q.id, opt)}
                            className={`px-4 py-2 rounded-full border-2 transition-all ${answers[q.id] === opt ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const Part2 = ({ answers, onAnswer }) => (
    <div className="space-y-8">
        {part2Questions.map(q => (
            <div key={q.id}>
                <h3 className="text-lg font-semibold mb-4">{q.text}</h3>
                <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-gray-500">전혀 그렇지 않다</span>
                    {[1, 2, 3, 4, 5].map(val => (
                        <button key={val} onClick={() => onAnswer(q.id, val)}
                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-bold ${answers[q.id] === val ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                            {val}
                        </button>
                    ))}
                    <span className="text-sm text-gray-500">매우 그렇다</span>
                </div>
            </div>
        ))}
    </div>
);

const Survey = ({ onComplete }) => {
    const [answers, setAnswers] = useState({});
    const totalQuestions = part1Questions.length + part2Questions.length;

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const allAnswered = Object.keys(answers).length === totalQuestions;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-2">Part 1. 기본 정보 설정하기</h2>
                <p className="text-gray-600">추천의 정확도를 높이기 위한 기본적인 정보예요.</p>
            </div>
            <Part1 answers={answers} onAnswer={handleAnswer} />

            <div className="mb-12 mt-16">
                <h2 className="text-2xl font-bold mb-2">Part 2. 당신의 스타일 알아보기</h2>
                <p className="text-gray-600">정답은 없으니, 가장 가깝다고 생각하는 곳에 편하게 체크해 주세요.</p>
            </div>
            <Part2 answers={answers} onAnswer={handleAnswer} />

            <button onClick={() => onComplete(answers)} disabled={!allAnswered}
                className="w-full mt-12 p-4 bg-blue-600 text-white font-bold rounded-lg disabled:bg-gray-300 hover:bg-blue-700 transition-colors text-lg">
                나에게 꼭 맞는 취미 추천받기
            </button>
        </div>
    );
};

const Results = ({ recommendations, onReset }) => (
    <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
            <div className='flex justify-between items-center'>
                <h2 className="text-2xl font-bold">🎉 맞춤 취미 추천</h2>
                <button onClick={onReset} className="text-sm text-blue-600 hover:underline">다시하기</button>
            </div>
            <p className="text-gray-600">당신의 답변을 바탕으로 아래의 취미를 추천해드려요!</p>
            {recommendations.length > 0 ? recommendations.map((hobby, index) => (
                <motion.div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{hobby.name}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{hobby.category}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{hobby.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {hobby.tags.map((tag, i) => (<span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">{tag}</span>))}
                    </div>
                    <div className="text-right font-bold text-blue-600">추천도: {hobby.matchRate}%</div>
                </motion.div>
            )) : <div className="text-center p-8 bg-white rounded-lg shadow-md">추천할 만한 취미를 찾지 못했어요.</div>}
        </div>
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-32">
                <h2 className="text-2xl font-bold mb-4">요즘 이런 취미로 많이 모여요</h2>
                <div className="space-y-4">
                    {popularHobbies.map((hobby) => (
                        <div key={hobby.rank} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-md">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">{hobby.rank}</div>
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800">{hobby.name}</p>
                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{hobby.category}</span>
                            </div>
                            <div className="text-sm text-gray-500">{hobby.recommendations}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// --- 메인 페이지 컴포넌트 ---
const HobbyRecommend = () => {
    const { user } = useAuth();
    const [step, setStep] = useState('loading');
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchResult = async () => {
            if (!user) {
                setStep('loginPrompt');
                return;
            }
            try {
                const response = await axios.get('/api/survey', { withCredentials: true });
                if (response.data && response.data.recommendations) {
                    setRecommendations(response.data.recommendations);
                    setStep('results');
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setStep('survey');
                } else {
                    console.error("결과를 불러오는 중 오류 발생:", error);
                    setStep('survey');
                }
            }
        };
        fetchResult();
    }, [user]);

    const calculateRecommendations = (answers) => {
        return hobbyDatabase.map(hobby => {
            let score = 0;
            part2Questions.forEach(q => {
                const userAnswer = answers[q.id];
                const hobbyScore = hobby.scores[q.id];
                // 점수 차이가 적을수록 높은 점수 (최대 5점)
                score += (5 - Math.abs(userAnswer - hobbyScore));
            });
            return { ...hobby, matchRate: Math.round((score / (part2Questions.length * 5)) * 100) };
        })
        .sort((a, b) => b.matchRate - a.matchRate)
        .slice(0, 3);
    };

    const handleSurveyComplete = async (answers) => {
        const results = calculateRecommendations(answers);
        setRecommendations(results);

        if (user) {
            try {
                await axios.post('/api/survey', { answers, recommendations: results }, { withCredentials: true });
            } catch (error) {
                console.error("결과 저장 중 오류 발생:", error);
            }
        }
        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setStep('survey');
        setRecommendations([]);
    };

    const renderContent = () => {
        switch (step) {
            case 'loginPrompt':
                return <LoginPrompt />;
            case 'survey':
                return <Survey onComplete={handleSurveyComplete} />;
            case 'results':
                return <Results recommendations={recommendations} onReset={handleReset} />;
            default:
                return <div className="text-center p-12 text-gray-500">사용자 정보를 확인하는 중...</div>;
        }
    };

    return (
        <div className="bg-gray-50 py-32 min-h-screen flex items-center">
            <div className="container mx-auto px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HobbyRecommend;