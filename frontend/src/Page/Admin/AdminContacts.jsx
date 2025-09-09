import React, { useState } from 'react';

// 임시 데이터 (나중에 백엔드에서 받아옵니다)
const dummyContacts = [
  { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', content: '제품 문의드립니다.', status: '답변 대기' },
  { id: 2, name: '김철수', email: 'kim@example.com', phone: '010-2345-6789', content: '서비스 관련 문의입니다.', status: '답변 완료' },
  { id: 3, name: '이영희', email: 'lee@example.com', phone: '010-3456-7890', content: '견적 문의합니다.', status: '답변 대기' },
];

const AdminContact = () => {
  const [contacts, setContacts] = useState(dummyContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');

  // 검색 및 필터링 로직
  const filteredContacts = contacts
    .filter(contact => {
      if (filterStatus !== 'all' && contact.status !== filterStatus) {
        return false;
      }
      if (searchTerm === '') {
        return true;
      }
      const fieldValue = contact[searchField]?.toLowerCase() || '';
      return fieldValue.includes(searchTerm.toLowerCase());
    });

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">문의 관리</h2>

      {/* 검색 및 필터링 UI */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <select 
            value={searchField} 
            onChange={e => setSearchField(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="name">이름</option>
            <option value="email">이메일</option>
            <option value="phone">휴대폰</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
          />
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">전체 상태</option>
            <option value="답변 대기">답변 대기</option>
            <option value="답변 완료">답변 완료</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
            <span>페이지당 표시:</span>
            <select className="border border-gray-300 rounded-md px-3 py-2">
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
            </select>
        </div>
      </div>
      <p className="text-gray-600 mb-4">총 {filteredContacts.length}개의 문의</p>

      {/* 문의 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              {['번호', '이름', '이메일', '휴대폰', '내용', '상태', '관리'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContacts.map((contact, index) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{contact.content}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contact.status === '답변 완료' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 페이지네이션 */}
      <div className="flex justify-center items-center mt-6">
        <nav className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-blue-600 p-2 rounded-md">이전</button>
          <span className="text-blue-600 font-bold p-2">1/1</span>
          <button className="text-gray-500 hover:text-blue-600 p-2 rounded-md">다음</button>
        </nav>
      </div>
    </div>
  );
};

export default AdminContact;