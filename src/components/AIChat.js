import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Loader, X, Sparkles } from 'lucide-react';

const AIChat = ({ 
  symbol, 
  portfolio, 
  stockData, 
  socialSentiment, 
  sectorAnalysis, 
  marketConditions 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContext = () => {
    return {
      portfolio: portfolio ? {
        holdings: portfolio.holdings,
        totalValue: portfolio.totalValue,
        performance: portfolio.performance
      } : null,
      currentStock: stockData ? {
        symbol: stockData.Symbol,
        name: stockData.Name,
        price: stockData.CurrentPrice,
        sector: stockData.sector,
        industry: stockData.industry,
        fundamentals: {
          peRatio: stockData.PERatio,
          marketCap: stockData.MarketCapitalization,
          roe: stockData.ReturnOnEquityTTM,
          debtToEquity: stockData.DebtToEquity
        }
      } : null,
      socialSentiment: socialSentiment,
      sectorAnalysis: sectorAnalysis,
      marketConditions: marketConditions
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://financial-analyst-backend-production-7175.up.railway.app/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: buildContext()
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        role: 'assistant',
        content: data.message,
        usage: data.usage,
        demo: data.demo
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze my portfolio risk",
    "Should I buy " + (symbol || "this stock") + "?",
    "How's the market looking today?",
    "Explain RSI to me",
    "Recommend diversification strategies"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.5)',
          zIndex: 1000,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.5)';
        }}
      >
        <Sparkles size={28} color="white" />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      maxWidth: '90vw',
      height: '600px',
      maxHeight: '80vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid #475569',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        padding: '1rem',
        borderRadius: '1rem 1rem 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} color="white" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
              InvestorIQ AI
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
              Your Financial Advisor
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={20} color="white" />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Bot size={48} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Hi! I'm your AI financial advisor. Ask me anything about stocks, your portfolio, or market conditions!
            </p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.role === 'user' ? '#3b82f6' : '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: msg.role === 'user' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : msg.error 
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(51, 65, 85, 0.5)',
              border: `1px solid ${msg.role === 'user' ? '#3b82f6' : msg.error ? '#ef4444' : '#475569'}`,
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
              {msg.demo && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#fbbf24'
                }}>
                  ⚠️ Demo mode - Add OpenAI API key for real analysis
                </div>
              )}
              {msg.usage && !msg.demo && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.65rem',
                  color: '#64748b'
                }}>
                  Cost: ${msg.usage.estimatedCost?.toFixed(4) || 0} • Tokens: {msg.usage.totalTokens}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #475569',
              borderRadius: '0.75rem'
            }}>
              <Loader size={16} className="spin" color="#8b5cf6" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #475569'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about stocks, portfolio, or market..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1rem',
              background: loading || !input.trim() ? '#475569' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
