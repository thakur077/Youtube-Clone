import { useState } from 'react';

export default function ThumbnailTest() {
  const [testResults, setTestResults] = useState([]);

  const testThumbnails = [
    'https://picsum.photos/640/360?random=1',
    'https://picsum.photos/640/360?random=2',
    'https://picsum.photos/640/360?random=3',
    'https://picsum.photos/640/360?random=4',
  ];

  const testImage = (url, index) => {
    const img = new Image();
    img.onload = () => {
      setTestResults(prev => [...prev, { index, url, status: 'success' }]);
    };
    img.onerror = () => {
      setTestResults(prev => [...prev, { index, url, status: 'error' }]);
    };
    img.src = url;
  };

  const runTests = () => {
    setTestResults([]);
    testThumbnails.forEach((url, index) => {
      testImage(url, index);
    });
  };

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Thumbnail Test</h3>
      <button 
        onClick={runTests}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mb-4"
      >
        Test Thumbnails
      </button>
      
      <div className="grid grid-cols-2 gap-4">
        {testThumbnails.map((url, index) => (
          <div key={index} className="border border-zinc-700 rounded p-2">
            <img 
              src={url} 
              alt={`Test ${index + 1}`}
              className="w-full h-32 object-cover rounded mb-2"
              onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
              onError={() => console.log(`Image ${index + 1} failed to load`)}
            />
            <p className="text-sm text-zinc-400">Test {index + 1}</p>
            <p className="text-xs text-zinc-500 break-all">{url}</p>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className={`text-sm ${result.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              Image {result.index + 1}: {result.status} 
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
