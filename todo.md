
# TODO:
- [ ] add checkmate indication // logic done, visuals missing
- [ ] add move history
- [ ] mobile screen
- [ ] sounds
- [ ] 2D
- [ ] ask what to promote to
- [ ] Let the player choose the difficulty // How ??  ChatGPT --> The fact that you're losing to Stockfish even at depth 1 is completely normal — even at its lowest depth, it's
                                                                    still extremely strong. Lowering the depth doesn't make it play at a human level; it just speeds up its calculations slightly. Depth 1 means Stockfish looks only one ply ahead 
                                                                    (half a move), but it still evaluates positions with grandmaster-level heuristics and evaluation functions. solution - pick xth best stockfish move
                                                           
                                                        TODO frontend - variable stockfishDiff is difficulty level (10 - ${stockfishDiff} - highest) (stockfishDiff = 1 - 10)

- [x] Three fulled repetition not working // stockfish repeats infinitely
- [x] add a way to resign/restart
- [x] add option to play as black
- [x] remove yellow ring after drag and drop move
- [x] right click to remove highlights of possible moves // also highlight right-clicked square // maybe would highligh only when not removing selection
- [x] change background to be less dark, black pieces are hard to see sometimes
