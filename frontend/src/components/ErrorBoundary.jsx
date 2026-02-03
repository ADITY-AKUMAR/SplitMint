import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log error info to a service here
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-xl">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {String(this.state.error)}
            </pre>
            <p className="mt-4 text-gray-600">
              Please check the console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
