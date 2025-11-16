import React, { useState } from 'react';
import { Activity, AlertCircle, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

const Education = ({ fredData }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={32} color="white" />
          Investment Education Center
        </h2>
        <p style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: '1rem' }}>
          Master the key financial indicators that professional investors use to make informed decisions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[
            { label: 'Topics Covered', value: '15+' },
            { label: 'Difficulty', value: 'Beginner-Friendly' },
            { label: 'Time to Complete', value: '~30 min' }
          ].map((stat, idx) => (
            <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#c7d2fe', marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Sections */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📊 Economic Indicators</h3>
        {[
          {
            title: 'Federal Funds Rate',
            importance: 'Critical',
            icon: '💰',
            description: 'The interest rate at which banks lend money to each other overnight.',
            whatItMeans: 'When the Fed raises this rate, borrowing becomes more expensive across the economy. When they lower it, borrowing becomes cheaper.',
            whyItMatters: 'This is THE most important rate in the U.S. economy. It affects mortgage rates, credit card rates, business loans, and stock valuations.',
            howToUse: [
              'Rising rates → Stocks may fall (especially growth stocks)',
              'Falling rates → Stocks often rise, bonds become less attractive',
              'High rates → Good for savers, bad for borrowers',
              'Low rates → Encourages spending and investment'
            ],
            example: 'In 2022-2023, the Fed raised rates from 0% to 5%+ to fight inflation. This caused stock markets to decline and mortgage rates to double.',
            currentValue: fredData?.['Federal Funds Rate']?.value
          },
          {
            title: 'Inflation Rate (CPI)',
            importance: 'Critical',
            icon: '📈',
            description: 'Measures how much prices for goods and services increase over time.',
            whatItMeans: 'The Consumer Price Index (CPI) tracks price changes for a basket of common goods like food, housing, and transportation.',
            whyItMatters: 'High inflation erodes purchasing power. It affects interest rates, wages, and investment returns. The Fed targets 2% annual inflation.',
            howToUse: [
              'High inflation (>3%) → Fed may raise rates, stocks volatile',
              'Low inflation (<2%) → Fed may lower rates, good for stocks',
              'Deflation (negative) → Economic trouble, avoid risk',
              'Compare inflation to your investment returns'
            ],
            example: 'In 2021-2022, inflation hit 9% (highest in 40 years). The Fed aggressively raised rates, causing a bear market.',
            currentValue: fredData?.['Inflation Rate (CPI)']?.value
          },
          {
            title: 'Unemployment Rate',
            importance: 'High',
            icon: '👥',
            description: 'Percentage of the labor force that is jobless and actively seeking employment.',
            whatItMeans: 'Lower unemployment = strong economy with job growth. Higher unemployment = economic weakness.',
            whyItMatters: 'Employment drives consumer spending (70% of GDP). Low unemployment can lead to wage inflation. High unemployment signals recession.',
            howToUse: [
              'Below 4% → Very strong economy, possible inflation pressure',
              '4-6% → Healthy range, balanced growth',
              'Above 6% → Weakness, recession risk',
              'Rising fast → Major economic problem'
            ],
            example: 'During COVID-19 (April 2020), unemployment hit 14.8%. By 2023, it fell to 3.5% - the lowest in 50 years.',
            currentValue: fredData?.['Unemployment Rate']?.value
          },
          {
            title: 'GDP Growth',
            importance: 'High',
            icon: '🏭',
            description: 'Measures the total value of all goods and services produced in the economy.',
            whatItMeans: 'GDP growth shows if the economy is expanding or contracting. Reported quarterly, annualized.',
            whyItMatters: 'Strong GDP growth = healthy economy, rising corporate profits, bullish for stocks. Negative GDP growth for 2 quarters = technical recession.',
            howToUse: [
              'Above 3% → Strong growth, bullish for stocks',
              '2-3% → Moderate, sustainable growth',
              '0-2% → Slow growth, caution',
              'Negative → Recession, defensive positioning'
            ],
            example: 'In 2020 Q2, GDP fell -31.4% (annualized) due to COVID lockdowns. By 2021, it rebounded to +6.7%.',
            currentValue: fredData?.['GDP Growth']?.value
          },
          {
            title: '10-Year Treasury Yield',
            importance: 'High',
            icon: '📜',
            description: 'The interest rate on 10-year U.S. government bonds.',
            whatItMeans: 'This is the "risk-free" benchmark rate. All other investments are compared to it.',
            whyItMatters: 'Higher yields make bonds more attractive vs. stocks. The 10-year yield affects mortgage rates, corporate borrowing costs, and stock valuations.',
            howToUse: [
              'Rising yields → Stocks may fall, especially tech/growth',
              'Falling yields → Bullish for stocks, especially growth',
              'Yield above 5% → Bonds competitive with stocks',
              'Inverted curve (2Y > 10Y) → Recession warning'
            ],
            example: 'In 2022, the 10-year yield rose from 1.5% to 4.25%, causing major stock market declines.',
            currentValue: fredData?.['10-Year Treasury']?.value
          },
          {
            title: 'Consumer Confidence',
            importance: 'Medium',
            icon: '😊',
            description: 'Measures how optimistic consumers are about the economy and their finances.',
            whatItMeans: 'High confidence means consumers are likely to spend money. Low confidence means they\'re worried and saving.',
            whyItMatters: 'Consumer spending is 70% of GDP. Confident consumers drive economic growth and corporate profits.',
            howToUse: [
              'Rising confidence → Bullish for retail, consumer stocks',
              'Falling confidence → Economic slowdown possible',
              'Very low (<50) → Recession risk',
              'Very high (>100) → Strong economy'
            ],
            example: 'During the 2008 financial crisis, consumer confidence fell to 25.3, the lowest ever recorded.',
            currentValue: fredData?.['Consumer Confidence']?.value
          }
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden', marginBottom: '1rem' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === `econ-${idx}` ? null : `econ-${idx}`)}
              style={{
                width: '100%',
                padding: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{item.title}</h3>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: item.importance === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : item.importance === 'High' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: item.importance === 'Critical' ? '#f87171' : item.importance === 'High' ? '#fb923c' : '#60a5fa'
                    }}>
                      {item.importance}
                    </div>
                    {item.currentValue && (
                      <div style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: '600' }}>
                        Current: {typeof item.currentValue === 'number' ? item.currentValue.toFixed(2) : item.currentValue}
                      </div>
                    )}
                  </div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>{item.description}</p>
                </div>
              </div>
              {expandedSection === `econ-${idx}` ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </button>
            
            {expandedSection === `econ-${idx}` && (
              <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #334155' }}>
                <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>📖 What It Means</h4>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{item.whatItMeans}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>💡 Why It Matters</h4>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{item.whyItMatters}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>🎯 How to Use It</h4>
                    <ul style={{ color: '#cbd5e1', lineHeight: '1.8', margin: '0.5rem 0 0 1.5rem', paddingLeft: '0.5rem' }}>
                      {item.howToUse.map((tip, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#93c5fd', marginBottom: '0.5rem' }}>📚 Real-World Example</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>{item.example}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stock Metrics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📈 Company Financial Metrics</h3>
        {[
          {
            title: 'P/E Ratio (Price-to-Earnings)',
            importance: 'Critical',
            icon: '💵',
            description: 'Compares a company\'s stock price to its earnings per share.',
            whatItMeans: 'Shows how much investors are willing to pay for $1 of earnings. Calculated as: Stock Price ÷ EPS.',
            whyItMatters: 'The most widely used valuation metric. Helps determine if a stock is overvalued or undervalued compared to peers and historical averages.',
            howToUse: [
              'Below 15 → Potentially undervalued or troubled',
              '15-25 → Fair value for most companies',
              'Above 30 → Expensive or high-growth expectations',
              'Compare to industry average and company history'
            ],
            example: 'Tech stocks often have P/E ratios of 30-50 because investors expect high growth. Banks typically have P/E of 10-15.'
          },
          {
            title: 'EPS (Earnings Per Share)',
            importance: 'Critical',
            icon: '💎',
            description: 'Company\'s profit divided by number of outstanding shares.',
            whatItMeans: 'Shows how much profit each share of stock represents. Higher is better.',
            whyItMatters: 'Direct measure of profitability. Growing EPS usually leads to higher stock prices. Wall Street focuses heavily on EPS growth.',
            howToUse: [
              'Look for consistent EPS growth (10%+ annually)',
              'Compare quarterly EPS to last year (YoY growth)',
              'Watch for EPS "beats" or "misses" vs estimates',
              'Negative EPS = company losing money'
            ],
            example: 'Apple\'s EPS grew from $3.28 (2019) to $6.11 (2022), and its stock price doubled during that time.'
          },
          {
            title: 'Revenue Growth',
            importance: 'High',
            icon: '📊',
            description: 'How much a company\'s sales are increasing or decreasing.',
            whatItMeans: 'Measures the company\'s ability to grow its business and market share.',
            whyItMatters: 'Revenue is the top line - it drives everything else. Consistent revenue growth shows a healthy, expanding business.',
            howToUse: [
              '10%+ annual growth → Strong performer',
              '5-10% → Moderate growth',
              'Below 5% → Slow growth or mature',
              'Negative → Declining business, investigate why'
            ],
            example: 'Amazon maintained 20%+ revenue growth for years, justifying its high valuation. As growth slowed to 10%, the stock struggled.'
          },
          {
            title: 'Profit Margin',
            importance: 'High',
            icon: '💰',
            description: 'Percentage of revenue that becomes profit after expenses.',
            whatItMeans: 'Shows how efficiently a company converts sales into profit. Calculated as: Net Income ÷ Revenue × 100.',
            whyItMatters: 'High margins = pricing power and efficiency. Low margins = competitive pressure or operational issues.',
            howToUse: [
              'Above 20% → Excellent (tech, software)',
              '10-20% → Good (many industries)',
              '5-10% → Thin margins (retail, groceries)',
              'Improving margins → Getting more efficient'
            ],
            example: 'Apple has 25% profit margins (premium pricing). Walmart has 2.5% margins (high volume, low prices).'
          },
          {
            title: 'Debt-to-Equity Ratio',
            importance: 'High',
            icon: '⚖️',
            description: 'Compares a company\'s total debt to shareholder equity.',
            whatItMeans: 'Shows how much the company relies on debt vs. equity to finance operations. Lower is usually better.',
            whyItMatters: 'High debt = financial risk. In downturns or rising rates, heavily indebted companies struggle. Shows financial health.',
            howToUse: [
              'Below 0.5 → Very safe, conservative',
              '0.5-1.5 → Moderate, acceptable',
              '1.5-2.5 → High debt, risky',
              'Above 3.0 → Very risky, avoid in uncertain times'
            ],
            example: 'During 2020 COVID crash, airlines with high debt (Delta: 6.0) fell 70%, while low-debt tech stocks recovered quickly.'
          },
          {
            title: 'ROE (Return on Equity)',
            importance: 'High',
            icon: '🎯',
            description: 'Measures how effectively a company uses shareholder money to generate profit.',
            whatItMeans: 'Shows the return generated on shareholders\' investment. Calculated as: Net Income ÷ Shareholder Equity × 100.',
            whyItMatters: 'High ROE = efficient use of capital. The best companies consistently deliver 15%+ ROE. Warren Buffett\'s favorite metric.',
            howToUse: [
              'Above 20% → Excellent, best-in-class',
              '15-20% → Strong performer',
              '10-15% → Average',
              'Below 10% → Weak, investigate'
            ],
            example: 'Apple consistently delivers 100%+ ROE due to share buybacks. Banks target 10-15% ROE.'
          },
          {
            title: 'Current Ratio',
            importance: 'Medium',
            icon: '💧',
            description: 'Measures a company\'s ability to pay short-term obligations.',
            whatItMeans: 'Compares current assets to current liabilities. Shows if company can pay its bills.',
            whyItMatters: 'Liquidity is critical. Companies with low current ratios can face bankruptcy if cash runs out.',
            howToUse: [
              'Above 2.0 → Very safe, plenty of liquidity',
              '1.0-2.0 → Healthy range',
              '0.5-1.0 → Tight, monitor closely',
              'Below 0.5 → Danger zone'
            ],
            example: 'Tesla in 2018 had a current ratio of 0.73, causing bankruptcy fears. By 2021, it improved to 1.4.'
          },
          {
            title: 'Dividend Yield',
            importance: 'Medium',
            icon: '💸',
            description: 'Annual dividend payment as a percentage of stock price.',
            whatItMeans: 'Shows how much income you get from owning the stock. Calculated as: Annual Dividend ÷ Stock Price × 100.',
            whyItMatters: 'Provides income and shows company confidence. Consistent dividend growth signals financial strength.',
            howToUse: [
              '0-2% → Growth company, reinvesting profits',
              '2-4% → Balanced, stable company',
              '4-6% → High yield, mature company',
              'Above 6% → Verify it\'s sustainable'
            ],
            example: 'Coca-Cola yields 3% and has increased dividends for 60+ consecutive years - a "Dividend Aristocrat".'
          }
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden', marginBottom: '1rem' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === `stock-${idx}` ? null : `stock-${idx}`)}
              style={{
                width: '100%',
                padding: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{item.title}</h3>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: item.importance === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : item.importance === 'High' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: item.importance === 'Critical' ? '#f87171' : item.importance === 'High' ? '#fb923c' : '#60a5fa'
                    }}>
                      {item.importance}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>{item.description}</p>
                </div>
              </div>
              {expandedSection === `stock-${idx}` ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </button>
            
            {expandedSection === `stock-${idx}` && (
              <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #334155' }}>
                <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>📖 What It Means</h4>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{item.whatItMeans}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>💡 Why It Matters</h4>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{item.whyItMatters}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>🎯 How to Use It</h4>
                    <ul style={{ color: '#cbd5e1', lineHeight: '1.8', margin: '0.5rem 0 0 1.5rem', paddingLeft: '0.5rem' }}>
                      {item.howToUse.map((tip, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#93c5fd', marginBottom: '0.5rem' }}>📚 Real-World Example</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>{item.example}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Investment Principles */}
      <div style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
          <AlertCircle size={32} color="#60a5fa" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.5rem' }}>🎓 Key Investment Principles</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>1. Never Rely on Just One Metric</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  Always analyze multiple indicators together. A company might have great revenue growth but terrible profit margins. 
                  Look at the complete picture before investing.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>2. Compare Within the Same Industry</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  Different industries have different normal ranges. Tech companies naturally have higher P/E ratios than banks. 
                  Always compare apples to apples.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>3. Watch for Trends, Not Just Snapshots</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  A single quarter's data doesn't tell the story. Look for consistent trends over multiple quarters and years. 
                  Improving metrics are more important than absolute values.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>4. Understand the Economic Cycle</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  Economic and market conditions matter. What works in a bull market (growth stocks) differs from a bear market (value, dividends). 
                  Adapt your strategy to current conditions.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>5. Quality Over Quick Gains</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  Focus on companies with strong fundamentals: consistent earnings growth, manageable debt, high ROE, and competitive advantages. 
                  These quality companies outperform over time.
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <p style={{ fontSize: '0.875rem', color: '#93c5fd', margin: 0, fontWeight: '600' }}>
                💡 Pro Tip: Use InvestorIQ's Company Analysis tab to practice analyzing real stocks with these metrics. 
                Start with well-known companies like Apple or Microsoft to see what "good" metrics look like!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;