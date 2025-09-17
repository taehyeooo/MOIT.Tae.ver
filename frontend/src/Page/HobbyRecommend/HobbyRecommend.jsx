import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaFire, FaUserPlus } from 'react-icons/fa'; // 👈 [추가] 통계 아이콘

// --- 데이터 영역 ---

const surveyQuestions = [
    { id: 'age', type: 'choice', text: '연령대를 선택해 주세요.', options: ['10대', '20대', '30대', '40대', '50대 이상'] },
    { id: 'gender', type: 'choice', text: '성별을 선택해 주세요.', options: ['남성', '여성', '선택 안 함'] },
    { id: 'job', type: 'choice', text: '현재 어떤 일을 하고 계신가요?', options: ['학생', '직장인', '프리랜서', '주부', '구직자', '기타'] },
    { id: 'time', type: 'choice', text: '일주일에 온전히 나를 위해 사용할 수 있는 시간은 어느 정도인가요?', options: ['3시간 미만', '3-5시간', '5-10시간', '10시간 이상'] },
    { id: 'budget', type: 'choice', text: '한 달에 취미 활동을 위해 얼마까지 지출할 수 있나요?', options: ['5만원 미만', '5-10만원', '10-20만원', '20만원 이상'] },
    { id: 'social', type: 'scale', text: '새로운 사람들과 어울리기보다, 혼자 또는 가까운 친구와 깊이 있는 시간을 보내는 것을 선호합니다.' },
    { id: 'spontaneity', type: 'scale', text: '반복적인 일상에 안정감을 느끼기보다, 예측 불가능한 새로운 경험을 통해 영감을 얻는 편입니다.' },
    { id: 'planning', type: 'scale', text: '즉흥적으로 행동하기보다, 명확한 목표를 세우고 계획에 따라 꾸준히 실행하는 것에서 성취감을 느낍니다.' },
    { id: 'creativity', type: 'scale', text: '정해진 규칙을 따르기보다, 나만의 방식과 스타일을 더해 독창적인 결과물을 만드는 것을 즐깁니다.' },
    { id: 'growth', type: 'scale', text: '과정 자체를 즐기는 것도 좋지만, 꾸준한 연습을 통해 실력이 향상되는 것을 눈으로 확인할 때 가장 큰 보람을 느낍니다.' },
    { id: 'energy', type: 'scale', text: '하루의 스트레스를 조용히 생각하며 풀기보다, 몸을 움직여 땀을 흘리며 해소하는 것을 선호합니다.' },
    { id: 'business', type: 'scale', text: '취미 활동을 통해 새로운 수익을 창출하거나, SNS에서 영향력을 키우는 것에 관심이 많습니다.' },
    { id: 'online', type: 'scale', text: '오프라인에서 직접 만나 교류하는 것만큼, 온라인 커뮤니티에서 소통하는 것에서도 강한 소속감을 느낍니다.' },
    { id: 'depth', type: 'scale', text: '하나의 취미를 깊게 파고드는 전문가가 되기보다, 다양한 분야를 경험해보는 제너럴리스트가 되고 싶습니다.' },
    { id: 'fun', type: 'scale', text: '이 취미를 통해 \'무엇을 얻을 수 있는가\'보다 \'그 순간이 얼마나 즐거운가\'가 더 중요합니다.' },
];

// --- 컴포넌트 영역 ---

// 👇 --- [추가] 통계 정보를 보여주는 사이드바 컴포넌트 --- 👇
const StatsSidebar = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error("통계 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { icon: FaUsers, label: '총 모임 수', value: stats?.totalMeetings, unit: '개' },
        { icon: FaFire, label: '가장 인기있는 카테고리', value: stats?.popularCategory, unit: '' },
        { icon: FaUserPlus, label: '이번 주 새 멤버', value: stats?.newUsersThisWeek, unit: '명' }
    ];

    if (loading) {
        return <div className="bg-white p-8 rounded-lg shadow-lg sticky top-32">로딩 중...</div>
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg sticky top-32">
            <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">MOIT 재미있는 통계</h2>
            <div className="space-y-6 mt-6">
                {statItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-500 rounded-lg">
                            <item.icon size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-lg">{item.value} {item.unit}</p>
                            <span className="text-sm text-gray-500">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


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

const Survey = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    
    const currentQuestion = surveyQuestions[currentStep];
    const totalSteps = surveyQuestions.length;

    const handleSelect = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(answers);
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    const isAnswered = answers[currentQuestion.id] !== undefined;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>진행률</span>
                        <span>{currentStep + 1} / {totalSteps}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                            className="bg-blue-600 h-2 rounded-full"
                            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">좋아하는 것을 알려주세요.</h2>
                <p className="text-gray-600 mb-8">몇 가지 질문으로 맞춤 취미를 추천드릴게요!</p>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[250px]"
                    >
                        <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>
                        {currentQuestion.type === 'choice' && (
                            <div className="space-y-3">
                                {currentQuestion.options.map(opt => (
                                    <div key={opt} onClick={() => handleSelect(opt)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name={currentQuestion.id} value={opt} checked={answers[currentQuestion.id] === opt} readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                            <span className="ml-3 text-gray-700">{opt}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentQuestion.type === 'scale' && (
                             <div className="flex justify-between items-center px-2">
                                <span className="text-sm text-gray-500">전혀 그렇지 않다</span>
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button key={val} onClick={() => handleSelect(val)}
                                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-lg ${answers[currentQuestion.id] === val ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                                        {val}
                                    </button>
                                ))}
                                <span className="text-sm text-gray-500">매우 그렇다</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                
                <div className="mt-10 flex justify-between items-center">
                    <button onClick={handlePrev} disabled={currentStep === 0}
                        className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors">
                        이전
                    </button>
                    <button onClick={handleNext} disabled={!isAnswered}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg disabled:bg-gray-300 hover:bg-blue-700 transition-colors">
                        {isLastStep ? '결과 보기' : '다음'}
                    </button>
                </div>
            </div>
            
            {/* 👇 --- [수정] 기존 인기 취미 섹션을 통계 컴포넌트로 교체 --- 👇 */}
            <StatsSidebar />
        </div>
    );
};

// ... (Results 컴포넌트는 이전과 동일)
const Results = ({ recommendations, onReset }) => (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
             <h2 className="text-3xl font-bold mb-2 text-blue-600">🎉 맞춤 취미 추천</h2>
             <p className="text-gray-600 mb-8">설문 결과를 바탕으로 3개의 취미를 추천해드려요!</p>
        </div>

        <div className="space-y-6 mt-8">
            {recommendations.length > 0 ? recommendations.map((hobby, index) => (
                <motion.div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{hobby.name}</h3>
                    <p className="text-gray-600 mb-4">{hobby.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {hobby.tags.map((tag, i) => (<span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>))}
                    </div>
                    <div className="text-right font-bold text-blue-600 text-lg">추천도: {hobby.matchRate}%</div>
                </motion.div>
            )) : <div className="text-center p-8 bg-white rounded-lg shadow-md">추천할 만한 취미를 찾지 못했어요.</div>}
        </div>

        <div className="text-center mt-10">
            <button 
                onClick={onReset} 
                className="px-8 py-3 border-2 border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
                다시 설문하기
            </button>
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
                    console.error("저장된 설문결과 로딩 실패:", error);
                    setStep('survey');
                }
            }
        };
        fetchResult();
    }, [user]);

    const getAiRecommendations = async (answers) => {
        console.log("AI 추천 API 호출 시뮬레이션. 전달된 답변:", answers);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const exampleResults = [
            { name: '모바일 게임', description: '스마트폰으로 즐기는 게임', tags: ['자율성/창작', '성장/숙련(유능성)', '새로운 경험(개방성)', '혼자 몰입'], matchRate: 10000 },
            { name: 'VR 게임', description: '가상현실 장비 기반 게임', tags: ['성장/숙련(유능성)', '자율성/창작', '새로운 경험(개방성)', '혼자 몰입'], matchRate: 9754 },
            { name: '퍼즐 게임', description: '스도쿠, 퍼즐류 게임', tags: ['자율성/창작', '성장/숙련(유능성)', '계획/꾸준함(성실성)', '혼자 몰입'], matchRate: 9643 },
        ];
        return exampleResults;
    };


    const handleSurveyComplete = async (answers) => {
        setStep('loading');
        const results = await getAiRecommendations(answers);
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
                // 👇 --- [수정] 결과 페이지는 통계 사이드바를 보여주지 않도록 별도 처리 --- 👇
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