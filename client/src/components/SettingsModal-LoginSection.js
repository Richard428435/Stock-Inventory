                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6 pt-6">
                    <h4 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                       Login Page Designer
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Background Type</label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundType: 'video' }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${designerForm.loginBackgroundType === 'video' ? 'bg-blue-500 text-white border-blue-400 shadow-md' : 'bg-white/40 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
                          >
                            Video
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundType: 'image' }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${designerForm.loginBackgroundType === 'image' ? 'bg-blue-500 text-white border-blue-400 shadow-md' : 'bg-white/40 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
                          >
                            Image
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Login Background {designerForm.loginBackgroundType === 'video' ? 'Video' : 'Image'}</label>
                        <div className="mt-2 flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl">
                          {designerForm.loginBackgroundUrl && (designerForm.loginBackgroundUrl.startsWith('data:') || designerForm.loginBackgroundUrl.startsWith('/uploads/')) ? (
                             <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0 flex items-center justify-center bg-slate-800">
                               {designerForm.loginBackgroundType === 'video' ? <span className="text-xs text-white/40">MP4</span> : <img src={designerForm.loginBackgroundUrl} alt="Preview" className="w-full h-full object-cover" />}
                             </div>
                          ) : null}
                          
                          <div className="flex-1 flex flex-wrap gap-2 items-center">
                            <input type="file" accept={designerForm.loginBackgroundType === 'video' ? "video/*" : "image/*"} onChange={(e) => handleFileUpload(e.target.files[0], 'loginBackgroundUrl')} className="hidden" id="login-bg-upload" />
                            <label htmlFor="login-bg-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                              {designerForm.loginBackgroundUrl ? 'Update Drive' : 'Upload to Drive'}
                            </label>
                            {designerForm.loginBackgroundUrl && (
                              <button 
                                type="button" 
                                onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundUrl: '' }))}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors outline-none"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
