import { StackRoutes } from './routes/stackRoutes';
import { NavigationContainer } from '@react-navigation/native';

// >>> Hotfix: redireciona chamadas da API antiga para a nova (somente Web)
if (typeof window !== 'undefined') {
  const MAP = [
    [
      'https://gerador-de-pdf-kq3xwc49j-startechsolutions-projects.vercel.app/api/options-pdf',
      'https://api-pdf-ct.vercel.app/api/options-pdf',
    ],
    [
      'https://gerador-de-pdf-kq3xwc49j-startechsolutions-projects.vercel.app',
      'https://api-pdf-ct.vercel.app',
    ],
  ];

  const swap = (u) => {
    let out = u;
    for (const [oldU, newU] of MAP) {
      while (typeof out === 'string' && out.includes(oldU)) out = out.replace(oldU, newU);
    }
    return out;
  };

  // window.open
  const _open = window.open?.bind(window);
  if (_open) {
    window.open = (url, name, specs) => _open(swap(url), name, specs);
  }

  // fetch
  const _fetch = window.fetch?.bind(window);
  if (_fetch) {
    window.fetch = (input, init) => {
      if (typeof input === 'string') return _fetch(swap(input), init);
      if (input && typeof input.url === 'string') {
        const replaced = swap(input.url);
        if (replaced !== input.url) return _fetch(new Request(replaced, input), init);
      }
      return _fetch(input, init);
    };
  }
}
// <<< Hotfix


export default function App() {
  return (
    <NavigationContainer>
      <StackRoutes/>
    </NavigationContainer>
  );
}